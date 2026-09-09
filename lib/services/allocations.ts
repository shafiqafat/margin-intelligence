import { createClient } from "@/lib/supabase/server";

export async function getCostAllocations(businessId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("cost_allocations")
    .select(
      `
        id,
        source_type,
        source_id,
        product_id,
        amount,
        allocation_method,
        created_at
      `,
    )
    .eq("business_id", businessId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Failed to load cost allocations:", error);
    return [];
  }

  return data;
}
