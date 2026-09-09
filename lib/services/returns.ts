import { createClient } from "@/lib/supabase/server";

export async function getReturns(businessId: string) {
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
        notes
      `,
    )
    .eq("business_id", businessId)
    .order("return_date", { ascending: true });

  if (error) {
    console.error("Failed to load returns:", error);
    return [];
  }

  return data;
}
