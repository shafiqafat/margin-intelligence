import { createClient } from "@/lib/supabase/server";

export async function getInsights(businessId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("insights")
    .select(
      `
        id,
        type,
        severity,
        title,
        description,
        financial_impact,
        what_happened,
        why_it_matters,
        what_to_investigate,
        entity_type,
        entity_id,
        status,
        detected_at,
        resolved_at,
        created_at
      `,
    )
    .eq("business_id", businessId)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    console.error("Failed to load insights:", error);

    return [];
  }

  return data;
}

export async function getInsightById(businessId: string, insightId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("insights")
    .select(
      `
        id,
        type,
        severity,
        title,
        description,
        financial_impact,
        what_happened,
        why_it_matters,
        what_to_investigate,
        entity_type,
        entity_id,
        status,
        detected_at,
        resolved_at,
        created_at
      `,
    )
    .eq("business_id", businessId)
    .eq("id", insightId)
    .single();

  if (error) {
    console.error("Failed to load insight:", error);

    return null;
  }

  return data;
}