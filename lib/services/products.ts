import { createClient } from "@/lib/supabase/server";

export async function getProducts(businessId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select("id, name, sku, category, selling_price, target_margin, status")
    .eq("business_id", businessId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Failed to load products:", error);
    return [];
  }

  return data;
}
export async function getProductById(businessId: string, productId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select(
      `
        id,
        name,
        sku,
        category,
        selling_price,
        target_margin,
        status
      `,
    )
    .eq("business_id", businessId)
    .eq("id", productId)
    .single();

  if (error) {
    console.error("Failed to load product:", error);
    return null;
  }

  return data;
}