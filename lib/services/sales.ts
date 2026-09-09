import { createClient } from "@/lib/supabase/server";

export async function getSaleItems(businessId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("sale_items")
    .select(
      `
        id,
        sale_id,
        product_id,
        quantity,
        unit_price,
        discount,
        total_price,
        sale:sales!inner(
          id,
          business_id,
          sale_date,
          shipping_revenue,
          delivery_cost,
          payment_fee,
          discount,
          total_revenue
        )
      `,
    )
    .eq("sale.business_id", businessId)
    .order("sale_date", {
      referencedTable: "sales",
      ascending: true,
    });

  if (error) {
    console.error("Failed to load sale items:", error);
    return [];
  }

  return data;
}
