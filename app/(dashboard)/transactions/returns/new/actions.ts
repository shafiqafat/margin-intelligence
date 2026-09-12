"use server";

import { redirect } from "next/navigation";

import { createReturn, type CreateReturnInput } from "@/lib/services/returns";

export async function createReturnAction(
  businessId: string,
  input: CreateReturnInput,
) {
  let returnId: string;

  try {
    returnId = await createReturn(businessId, input);
  } catch (error) {
    console.error("Create return action failed:", error);

    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create return",
    };
  }

  redirect(`/transactions/returns/${returnId}`);
}
