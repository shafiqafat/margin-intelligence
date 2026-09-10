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
  supplier_id,
  purchase_date,
  supplier:suppliers(
    name
  )
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

  return data
    .map((item) => {
      const purchase = Array.isArray(item.purchase)
        ? item.purchase[0]
        : item.purchase;

      const supplier = purchase?.supplier;

      if (!purchase || !supplier) {
        return null;
      }

      const normalizedSupplier = Array.isArray(supplier)
        ? supplier[0]
        : supplier;

      if (!normalizedSupplier) {
        return null;
      }

      return {
        id: item.id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_cost: item.unit_cost,
        total_cost: item.total_cost,

        purchase: {
          id: purchase.id,
          business_id: purchase.business_id,
          supplier_id: purchase.supplier_id,
          purchase_date: purchase.purchase_date,

          supplier: normalizedSupplier,
        },
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);
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

export async function getPurchases(businessId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("purchases")
    .select(
      `
        id,
        supplier_id,
        purchase_date,
        reference,
        subtotal,
        shipping_cost,
        additional_cost,
        total_cost,
        notes,
        created_at,
        supplier:suppliers(
          name
        )
      `,
    )
    .eq("business_id", businessId)
    .order("purchase_date", {
      ascending: false,
    });

  if (error) {
    console.error("Failed to load purchases:", error);

    return [];
  }

  return data.map((purchase) => {
    const supplier = Array.isArray(purchase.supplier)
      ? purchase.supplier[0]
      : purchase.supplier;

    return {
      id: purchase.id,
      supplier_id: purchase.supplier_id,
      purchase_date: purchase.purchase_date,
      reference: purchase.reference,
      subtotal: purchase.subtotal,
      shipping_cost: purchase.shipping_cost,
      additional_cost: purchase.additional_cost,
      total_cost: purchase.total_cost,
      notes: purchase.notes,
      created_at: purchase.created_at,
      supplier,
    };
  });
}
export async function getPurchaseById(businessId: string, purchaseId: string) {
  const supabase = await createClient();

  const { data: purchase, error: purchaseError } = await supabase
    .from("purchases")
    .select(
      `
          id,
          supplier_id,
          purchase_date,
          reference,
          subtotal,
          shipping_cost,
          additional_cost,
          total_cost,
          notes,
          created_at,
          supplier:suppliers(
            name,
            contact_name
          )
        `,
    )
    .eq("business_id", businessId)
    .eq("id", purchaseId)
    .single();

  if (purchaseError || !purchase) {
    console.error("Failed to load purchase:", purchaseError);

    return null;
  }

  const { data: items, error: itemsError } = await supabase
    .from("purchase_items")
    .select(
      `
          id,
          product_id,
          quantity,
          unit_cost,
          total_cost,
          product:products(
            name,
            sku
          )
        `,
    )
    .eq("purchase_id", purchaseId)
    .order("created_at", {
      ascending: true,
    });

  if (itemsError) {
    console.error("Failed to load purchase items:", itemsError);

    return null;
  }

  const { data: allocations, error: allocationsError } = await supabase
    .from("cost_allocations")
    .select(
      `
          id,
          product_id,
          amount,
          allocation_method
        `,
    )
    .eq("business_id", businessId)
    .eq("source_type", "purchase")
    .eq("source_id", purchaseId)
    .order("created_at", {
      ascending: true,
    });

  if (allocationsError) {
    console.error("Failed to load purchase allocations:", allocationsError);

    return null;
  }

  return {
    ...purchase,
    supplier: Array.isArray(purchase.supplier)
      ? (purchase.supplier[0] ?? null)
      : purchase.supplier,
    items: items.map((item) => ({
      ...item,
      product: Array.isArray(item.product)
        ? (item.product[0] ?? null)
        : item.product,
    })),
    allocations,
  };
}