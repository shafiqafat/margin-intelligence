"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentBusiness } from "@/lib/services/business";
import { productSchema } from "@/lib/validations/products";

export type CreateProductState = {
  success: boolean;
  message: string;
  errors?: {
    name?: string[];
    sku?: string[];
    category?: string[];
    sellingPrice?: string[];
    targetMargin?: string[];
  };
};

export async function createProduct(
  _previousState: CreateProductState,
  formData: FormData,
): Promise<CreateProductState> {
  const name = formData.get("name");
  const sku = formData.get("sku");
  const category = formData.get("category");
  const sellingPrice = formData.get("sellingPrice");
  const targetMargin = formData.get("targetMargin");

  const parsed = productSchema.safeParse({
    name: typeof name === "string" ? name : "",
    sku: typeof sku === "string" ? sku : "",
    category: typeof category === "string" ? category : "",
    sellingPrice: typeof sellingPrice === "string" ? Number(sellingPrice) : NaN,
    targetMargin: typeof targetMargin === "string" ? Number(targetMargin) : NaN,
  });

  if (!parsed.success) {
    return {
      success: false,
      message: "Please fix the errors below.",
      errors: parsed.error.flatten().fieldErrors,
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

  const { error } = await supabase.from("products").insert({
    business_id: business.id,
    name: parsed.data.name,
    sku: parsed.data.sku || null,
    category: parsed.data.category || null,
    selling_price: parsed.data.sellingPrice,
    target_margin: parsed.data.targetMargin,
    status: "active",
  });

  if (error) {
    console.error("Failed to create product:", error);

    return {
      success: false,
      message: "Failed to create product.",
    };
  }

  revalidatePath("/products");

  return {
    success: true,
    message: "Product created successfully.",
  };
}
export async function updateProduct(
  _previousState: CreateProductState,
  formData: FormData,
): Promise<CreateProductState> {
  const productId = formData.get("productId");
  const name = formData.get("name");
  const sku = formData.get("sku");
  const category = formData.get("category");
  const sellingPrice = formData.get("sellingPrice");
  const targetMargin = formData.get("targetMargin");

  if (typeof productId !== "string" || !productId) {
    return {
      success: false,
      message: "Product ID is required.",
    };
  }

  const parsed = productSchema.safeParse({
    name: typeof name === "string" ? name : "",
    sku: typeof sku === "string" ? sku : "",
    category: typeof category === "string" ? category : "",
    sellingPrice: typeof sellingPrice === "string" ? Number(sellingPrice) : NaN,
    targetMargin: typeof targetMargin === "string" ? Number(targetMargin) : NaN,
  });

  if (!parsed.success) {
    return {
      success: false,
      message: "Please fix the errors below.",
      errors: parsed.error.flatten().fieldErrors,
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

  const { data: existingProduct, error: productLookupError } = await supabase
    .from("products")
    .select("id")
    .eq("id", productId)
    .eq("business_id", business.id)
    .single();

  if (productLookupError || !existingProduct) {
    return {
      success: false,
      message: "Product not found.",
    };
  }

  const { error } = await supabase
    .from("products")
    .update({
      name: parsed.data.name,
      sku: parsed.data.sku || null,
      category: parsed.data.category || null,
      selling_price: parsed.data.sellingPrice,
      target_margin: parsed.data.targetMargin,
    })
    .eq("id", productId)
    .eq("business_id", business.id);

  if (error) {
    console.error("Failed to update product:", error);

    return {
      success: false,
      message: "Failed to update product.",
    };
  }

  revalidatePath("/products");
  revalidatePath(`/products/${productId}`);

  return {
    success: true,
    message: "Product updated successfully.",
  };
}

export async function deactivateProduct(productId: string) {
  const business = await getCurrentBusiness();

  if (!business) {
    return {
      success: false,
      message: "No business was found.",
    };
  }

  if (!productId) {
    return {
      success: false,
      message: "Product ID is required.",
    };
  }

  const supabase = await createClient();

  const { data: existingProduct, error: lookupError } = await supabase
    .from("products")
    .select("id, status")
    .eq("id", productId)
    .eq("business_id", business.id)
    .single();

  if (lookupError || !existingProduct) {
    return {
      success: false,
      message: "Product not found.",
    };
  }

  if (existingProduct.status === "inactive") {
    return {
      success: false,
      message: "Product is already inactive.",
    };
  }

  const { error } = await supabase
    .from("products")
    .update({
      status: "inactive",
    })
    .eq("id", productId)
    .eq("business_id", business.id);

  if (error) {
    console.error("Failed to deactivate product:", error);

    return {
      success: false,
      message: "Failed to deactivate product.",
    };
  }

  revalidatePath("/products");
  revalidatePath(`/products/${productId}`);

  return {
    success: true,
    message: "Product deactivated successfully.",
  };
}