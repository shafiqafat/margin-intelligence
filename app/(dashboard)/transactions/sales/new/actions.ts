"use server";

import { redirect } from "next/navigation";

import { createSale, type CreateSaleInput } from "@/lib/services/sales";

export async function createSaleAction(
  businessId: string,
  input: CreateSaleInput,
) {
  let saleId: string;

  try {
    saleId = await createSale(businessId, input);
  } catch (error) {
    console.error("Create sale action failed:", error);

    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create sale",
    };
  }

  redirect(`/transactions/sales/${saleId}`);
}
