"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { getCurrentBusiness } from "@/lib/services/business";
import { supplierSchema } from "@/lib/validations/suppliers";

export type CreateSupplierState = {
  success: boolean;
  message: string;
  errors?: {
    name?: string[];
    contactName?: string[];
    email?: string[];
    phone?: string[];
    notes?: string[];
  };
};

export async function createSupplier(
  _previousState: CreateSupplierState,
  formData: FormData,
): Promise<CreateSupplierState> {
  const name = formData.get("name");
  const contactName = formData.get("contactName");
  const email = formData.get("email");
  const phone = formData.get("phone");
  const notes = formData.get("notes");

  const parsed = supplierSchema.safeParse({
    name: typeof name === "string" ? name : "",
    contactName: typeof contactName === "string" ? contactName : "",
    email: typeof email === "string" ? email : "",
    phone: typeof phone === "string" ? phone : "",
    notes: typeof notes === "string" ? notes : "",
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

  const { error } = await supabase.from("suppliers").insert({
    business_id: business.id,
    name: parsed.data.name,
    contact_name: parsed.data.contactName || null,
    email: parsed.data.email || null,
    phone: parsed.data.phone || null,
    notes: parsed.data.notes || null,
  });

  if (error) {
    console.error("Failed to create supplier:", error);

    return {
      success: false,
      message: "Failed to create supplier.",
    };
  }

  revalidatePath("/suppliers");

  return {
    success: true,
    message: "Supplier created successfully.",
  };
}

export async function updateSupplier(
  _previousState: CreateSupplierState,
  formData: FormData,
): Promise<CreateSupplierState> {
  const supplierId = formData.get("supplierId");
  const name = formData.get("name");
  const contactName = formData.get("contactName");
  const email = formData.get("email");
  const phone = formData.get("phone");
  const notes = formData.get("notes");

  if (typeof supplierId !== "string" || !supplierId) {
    return {
      success: false,
      message: "Supplier ID is required.",
    };
  }

  const parsed = supplierSchema.safeParse({
    name: typeof name === "string" ? name : "",
    contactName: typeof contactName === "string" ? contactName : "",
    email: typeof email === "string" ? email : "",
    phone: typeof phone === "string" ? phone : "",
    notes: typeof notes === "string" ? notes : "",
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

  const { data: existingSupplier, error: lookupError } = await supabase
    .from("suppliers")
    .select("id")
    .eq("id", supplierId)
    .eq("business_id", business.id)
    .single();

  if (lookupError || !existingSupplier) {
    return {
      success: false,
      message: "Supplier not found.",
    };
  }

  const { error } = await supabase
    .from("suppliers")
    .update({
      name: parsed.data.name,
      contact_name: parsed.data.contactName || null,
      email: parsed.data.email || null,
      phone: parsed.data.phone || null,
      notes: parsed.data.notes || null,
    })
    .eq("id", supplierId)
    .eq("business_id", business.id);

  if (error) {
    console.error("Failed to update supplier:", error);

    return {
      success: false,
      message: "Failed to update supplier.",
    };
  }

  revalidatePath("/suppliers");
  revalidatePath(`/suppliers/${supplierId}`);

  return {
    success: true,
    message: "Supplier updated successfully.",
  };
}