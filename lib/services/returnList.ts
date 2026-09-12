import { createClient } from "@/lib/supabase/server";

export async function getReturnListData(businessId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("returns")
    .select(
      `
        id,
        sale_id,
        product_id,
        quantity,
        reason,
        refund_amount,
        return_shipping_cost,
        restocking_cost,
        return_date,
        sale:sales(
          reference
        ),
        product:products(
          name,
          sku
        )
      `,
    )
    .eq("business_id", businessId)
    .order("return_date", {
      ascending: false,
    });

  if (error) {
    console.error("Failed to load return list:", error);

    return [];
  }

  return data.map((returnRecord) => {
    const sale = Array.isArray(returnRecord.sale)
      ? (returnRecord.sale[0] ?? null)
      : returnRecord.sale;

    const product = Array.isArray(returnRecord.product)
      ? (returnRecord.product[0] ?? null)
      : returnRecord.product;

    const returnCosts =
      returnRecord.return_shipping_cost + returnRecord.restocking_cost;

    const totalImpact = returnRecord.refund_amount + returnCosts;

    return {
      ...returnRecord,
      sale,
      product,
      returnCosts,
      totalImpact,
    };
  });
}
