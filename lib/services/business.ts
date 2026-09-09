import { createClient } from "@/lib/supabase/server";

export async function getCurrentBusiness() {
  const supabase = await createClient();

  const { data, error: claimsError } = await supabase.auth.getClaims();

  if (claimsError || !data?.claims?.sub) {
    return null;
  }

  const userId = data.claims.sub;

  const { data: business, error } = await supabase
    .from("businesses")
    .select("id, name, business_type, country, currency, timezone")
    .eq("owner_id", userId)
    .single();

  if (error) {
    console.error("Failed to load current business:", error);
    return null;
  }

  return business;
}
