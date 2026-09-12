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

export async function getReturnById(businessId: string, returnId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("returns")
    .select(
      `
        id,
        business_id,
        sale_id,
        product_id,
        quantity,
        reason,
        refund_amount,
        return_shipping_cost,
        restocking_cost,
        return_date,
        notes,
        created_at,
        sale:sales(
          id,
          sale_date,
          reference
        ),
        product:products(
          id,
          name,
          sku
        )
      `,
    )
    .eq("business_id", businessId)
    .eq("id", returnId)
    .single();

  if (error) {
    console.error("Failed to load return:", error);

    return null;
  }

  return {
    ...data,

    sale: Array.isArray(data.sale) ? (data.sale[0] ?? null) : data.sale,

    product: Array.isArray(data.product)
      ? (data.product[0] ?? null)
      : data.product,
  };
}

export type CreateReturnInput = {
  saleId: string;
  productId: string;
  quantity: number;
  reason?: string;
  refundAmount: number;
  returnShippingCost: number;
  restockingCost: number;
  returnDate: string;
  notes?: string;
};

export async function createReturn(
  businessId: string,
  input: CreateReturnInput,
) {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("create_return", {
    p_business_id: businessId,
    p_sale_id: input.saleId,
    p_product_id: input.productId,
    p_quantity: input.quantity,
    p_reason: input.reason ?? null,
    p_refund_amount: input.refundAmount,
    p_return_shipping_cost: input.returnShippingCost,
    p_restocking_cost: input.restockingCost,
    p_return_date: input.returnDate,
    p_notes: input.notes ?? null,
  });

  if (error) {
    console.error("Failed to create return:", error);
    throw new Error(error.message);
  }

  return data as string;
}