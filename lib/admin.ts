import { createClient } from "@/lib/supabase/server";

/**
 * Returns the current user if they exist AND have profiles.is_admin = true.
 * Otherwise returns null. Use to gate admin pages and API routes.
 */
export async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) return null;
  return { user, supabase };
}
