import { getMarginAnalysis } from "@/lib/services/margins";
import { getPurchaseItems } from "@/lib/services/purchases";
import { getSaleItems } from "@/lib/services/sales";
import { getReturns } from "@/lib/services/returns";
import { createClient } from "@/lib/supabase/server";

import { generateInsights } from "@/domain/intelligence/generateInsights";

export async function getGeneratedInsights(businessId: string) {
  const [marginAnalysis, purchaseItems, saleItems, returns] = await Promise.all(
    [
      getMarginAnalysis(businessId),
      getPurchaseItems(businessId),
      getSaleItems(businessId),
      getReturns(businessId),
    ],
  );

  return generateInsights(
    marginAnalysis.products,

    purchaseItems.map((item) => ({
  productId: item.product_id,
  supplierId:
    item.purchase.supplier_id,
  supplierName:
    item.purchase.supplier.name,
  purchaseDate:
    item.purchase.purchase_date,
  quantity: item.quantity,
  unitCost: item.unit_cost,
})),

    saleItems.map((item) => ({
      productId: item.product_id,
      quantity: item.quantity,
    })),

    returns.map((returnRecord) => ({
      productId: returnRecord.product_id,
      quantity: returnRecord.quantity,
    })),
  );
}

export async function syncInsights(businessId: string) {
  const supabase = await createClient();

  const findings = await getGeneratedInsights(businessId);

  const syncedInsights = [];

  for (const finding of findings) {
    const { data: existingInsight, error: findError } = await supabase
      .from("insights")
      .select(
        `
            id,
            status,
            financial_impact,
            description,
            severity,
            title,
            detected_at
          `,
      )
      .eq("business_id", businessId)
      .eq("type", finding.type)
      .eq("entity_type", "product")
      .eq("entity_id", finding.productId)
      .in("status", ["new", "viewed", "investigating", "action_taken"])
      .maybeSingle();

    if (findError) {
      console.error("Failed to find existing insight:", findError);

      continue;
    }

    if (existingInsight) {
      const { data: updatedInsight, error: updateError } = await supabase
        .from("insights")
        .update({
          severity: finding.severity,
          title: finding.title,
          description: finding.description,
          financial_impact: finding.financialImpact,
          detected_at: existingInsight.detected_at,
        })
        .eq("id", existingInsight.id)
        .select()
        .single();

      if (updateError) {
        console.error("Failed to update insight:", updateError);

        continue;
      }

      syncedInsights.push(updatedInsight);
      continue;
    }

    const { data: newInsight, error: insertError } = await supabase
      .from("insights")
      .insert({
        business_id: businessId,
        type: finding.type,
        severity: finding.severity,
        title: finding.title,
        description: finding.description,
        financial_impact: finding.financialImpact,
        entity_type: "product",
        entity_id: finding.productId,
        status: "new",
      })
      .select()
      .single();

    if (insertError) {
      if (insertError.code === "23505") {
        const { data: existingInsight } = await supabase
          .from("insights")
          .select()
          .eq("business_id", businessId)
          .eq("type", finding.type)
          .eq("entity_type", "product")
          .eq("entity_id", finding.productId)
          .in("status", ["new", "viewed", "investigating", "action_taken"])
          .maybeSingle();

        if (existingInsight) {
          syncedInsights.push(existingInsight);
        }

        continue;
      }

      console.error("Failed to create insight:", insertError);

      continue;
    }

    syncedInsights.push(newInsight);
  }

  return syncedInsights;
}
