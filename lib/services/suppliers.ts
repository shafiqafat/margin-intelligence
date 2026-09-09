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
    .order("created_at", {
      ascending: true,
    });

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

export async function getSupplierProducts(
  businessId: string,
  supplierId: string,
) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("product_suppliers")
    .select(
      `
        id,
        is_primary,
        product:products!inner(
          id,
          name,
          sku,
          category,
          selling_price,
          status,
          business_id
        )
      `,
    )
    .eq("supplier_id", supplierId)
    .eq("product.business_id", businessId)
    .order("created_at", {
      ascending: true,
    });

  if (error) {
    console.error("Failed to load supplier products:", error);

    return [];
  }

  return data.map((relationship) => {
    const product = Array.isArray(relationship.product)
      ? relationship.product[0]
      : relationship.product;

    return {
      id: relationship.id,
      is_primary: relationship.is_primary,
      product,
    };
  });
}
