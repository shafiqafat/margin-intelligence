"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { getCurrentBusiness } from "@/lib/services/business";

const ALLOWED_STATUSES = [
  "new",
  "viewed",
  "investigating",
  "action_taken",
  "resolved",
] as const;

type InsightStatus = (typeof ALLOWED_STATUSES)[number];

export async function updateInsightStatus(
  insightId: string,
  status: InsightStatus,
) {
  if (!ALLOWED_STATUSES.includes(status)) {
    throw new Error("Invalid insight status.");
  }

  const business = await getCurrentBusiness();

  if (!business) {
    throw new Error("Business not found.");
  }

  const supabase = await createClient();

  const updateData: {
    status: InsightStatus;
    resolved_at?: string | null;
  } = {
    status,
  };

  if (status === "resolved") {
    updateData.resolved_at = new Date().toISOString();
  } else {
    updateData.resolved_at = null;
  }

  const { error } = await supabase
    .from("insights")
    .update(updateData)
    .eq("id", insightId)
    .eq("business_id", business.id);

  if (error) {
    console.error("Failed to update insight status:", error);

    throw new Error("Failed to update insight status.");
  }

  revalidatePath("/insights");
  revalidatePath("/alerts");
}
