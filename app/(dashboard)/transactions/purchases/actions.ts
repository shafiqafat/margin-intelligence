"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { getCurrentBusiness } from "@/lib/services/business";
import { purchaseSchema } from "@/lib/validations/purchases";

export type CreatePurchaseState = {
  success: boolean;
  message: string;
  purchaseId?: string;
};

export async function createPurchase(
  _previousState: CreatePurchaseState,
  formData: FormData,
): Promise<CreatePurchaseState> {
  const supplierId = formData.get("supplierId");
  const purchaseDate = formData.get("purchaseDate");
  const reference = formData.get("reference");
  const shippingCost = formData.get("shippingCost");
  const additionalCost = formData.get("additionalCost");
  const notes = formData.get("notes");
  const items = formData.get("items");

  let parsedItems: unknown;

  try {
    parsedItems = typeof items === "string" ? JSON.parse(items) : [];
  } catch {
    return {
      success: false,
      message: "Invalid purchase items.",
    };
  }

  const parsed = purchaseSchema.safeParse({
    supplierId: typeof supplierId === "string" ? supplierId : "",

    purchaseDate: typeof purchaseDate === "string" ? purchaseDate : "",

    reference: typeof reference === "string" ? reference : "",

    shippingCost: typeof shippingCost === "string" ? Number(shippingCost) : NaN,

    additionalCost:
      typeof additionalCost === "string" ? Number(additionalCost) : NaN,

    notes: typeof notes === "string" ? notes : "",

    items: parsedItems,
  });

  if (!parsed.success) {
    return {
      success: false,
      message:
        parsed.error.issues[0]?.message ?? "Please check the purchase details.",
    };
  }

  const business = await getCurrentBusiness();

  if (!business) {
    return {
      success: false,
      message: "No business was found.",
    };
  }

  const supabase = await createClient();

  const { data, error } = await supabase.rpc("create_purchase", {
    p_business_id: business.id,
    p_supplier_id: parsed.data.supplierId,
    p_purchase_date: parsed.data.purchaseDate,
    p_reference: parsed.data.reference || null,
    p_shipping_cost: parsed.data.shippingCost,
    p_additional_cost: parsed.data.additionalCost,
    p_notes: parsed.data.notes || null,
    p_items: parsed.data.items,
  });

  if (error) {
    console.error("Failed to create purchase:", error);

    return {
      success: false,
      message: error.message || "Failed to create purchase.",
    };
  }

  revalidatePath("/transactions/purchases");
  revalidatePath("/products");

  return {
    success: true,
    message: "Purchase recorded successfully.",
    purchaseId: data,
  };
}
