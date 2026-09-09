import { createClient } from "@/lib/supabase/server";

export async function getSuppliers(businessId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("suppliers")
    .select(
      `
        id,
        name,
        contact_name,
        email,
        phone,
        notes,
        created_at
      `,
    )
    .eq("business_id", businessId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Failed to load suppliers:", error);
    return [];
  }

  return data;
}

export async function getSupplierById(businessId: string, supplierId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("suppliers")
    .select(
      `
        id,
        name,
        contact_name,
        email,
        phone,
        notes,
        created_at
      `,
    )
    .eq("business_id", businessId)
    .eq("id", supplierId)
    .single();

  if (error) {
    console.error("Failed to load supplier:", error);
    return null;
  }

  return data;
}
