import { createClient } from "@/lib/supabase/server";

export async function getPurchaseItems(businessId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("purchase_items")
    .select(
      `
        id,
        product_id,
        quantity,
        unit_cost,
        total_cost,
        purchase:purchases!inner(
          id,
          business_id,
          purchase_date
        )
      `,
    )
    .eq("purchase.business_id", businessId)
    .order("purchase_date", {
      referencedTable: "purchases",
      ascending: true,
    });

  if (error) {
    console.error("Failed to load purchase items:", error);
    return [];
  }

  return data;
}

export type CreatePurchaseItemInput = {
  productId: string;
  quantity: number;
  unitCost: number;
};

export type CreatePurchaseInput = {
  supplierId: string;
  purchaseDate: string;
  reference?: string;
  shippingCost: number;
  additionalCost: number;
  notes?: string;
  items: CreatePurchaseItemInput[];
};