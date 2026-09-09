import { createClient } from "@/lib/supabase/server";

export async function getExpenses(businessId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("expenses")
    .select(
      `
        id,
        category_id,
        product_id,
        description,
        amount,
        expense_date
      `,
    )
    .eq("business_id", businessId)
    .order("expense_date", { ascending: true });

  if (error) {
    console.error("Failed to load expenses:", error);
    return [];
  }

  return data;
}
