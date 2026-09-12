import { createClient } from "@/lib/supabase/server";

export async function getSales(businessId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("sales")
    .select(
      `
      id,
      sale_date,
      reference,
      shipping_revenue,
      delivery_cost,
      payment_fee,
      discount,
      total_revenue,
      notes,
      created_at
    `,
    )
    .eq("business_id", businessId)
    .order("sale_date", {
      ascending: false,
    });

  if (error) {
    console.error("Failed to load sales:", error);
    return [];
  }

  return data;
}

export async function getSaleById(businessId: string, saleId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("sales")
    .select(
      `
      id,
      business_id,
      sale_date,
      reference,
      shipping_revenue,
      delivery_cost,
      payment_fee,
      discount,
      total_revenue,
      notes,
      created_at,
      sale_items(
        id,
        product_id,
        quantity,
        unit_price,
        discount,
        total_price,
        product:products(
          id,
          name,
          sku
        )
      )
    `,
    )
    .eq("business_id", businessId)
    .eq("id", saleId)
    .single();

  if (error) {
    console.error("Failed to load sale:", error);
    return null;
  }

  return {
    ...data,
    sale_items: data.sale_items.map((item) => ({
      ...item,
      product: Array.isArray(item.product)
        ? (item.product[0] ?? null)
        : item.product,
    })),
  };
}

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

  return data.map((item) => ({
    ...item,
    sale: Array.isArray(item.sale) ? (item.sale[0] ?? null) : item.sale,
  }));
}

export type CreateSaleItemInput = {
  productId: string;
  quantity: number;
  unitPrice: number;
  discount: number;
};

export type CreateSaleInput = {
  saleDate: string;
  reference?: string;
  shippingRevenue: number;
  deliveryCost: number;
  paymentFee: number;
  notes?: string;
  items: CreateSaleItemInput[];
};

export async function createSale(businessId: string, input: CreateSaleInput) {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("create_sale", {
    p_business_id: businessId,
    p_sale_date: input.saleDate,
    p_reference: input.reference ?? null,
    p_shipping_revenue: input.shippingRevenue,
    p_delivery_cost: input.deliveryCost,
    p_payment_fee: input.paymentFee,
    p_notes: input.notes ?? null,
    p_items: input.items,
  });

  if (error) {
    console.error("Failed to create sale:", error);
    throw new Error(error.message);
  }

  return data as string;
}

export async function getSalesForReturn(businessId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("sales")
    .select(
      `
        id,
        sale_date,
        reference,
        sale_items(
          id,
          product_id,
          quantity,
          unit_price,
          discount,
          total_price,
          product:products(
            id,
            name,
            sku
          )
        )
      `,
    )
    .eq("business_id", businessId)
    .order("sale_date", {
      ascending: false,
    });

  if (error) {
    console.error("Failed to load sales for return:", error);

    return [];
  }

  return data.map((sale) => ({
    ...sale,

    sale_items: sale.sale_items.map((item) => ({
      ...item,

      product: Array.isArray(item.product)
        ? (item.product[0] ?? null)
        : item.product,
    })),
  }));
}