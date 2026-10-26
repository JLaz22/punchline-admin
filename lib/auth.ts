import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
export async function requireAdmin() {
  const db = await createClient();
  const {
    data: { user },
    error,
  } = await db.auth.getUser();
  if (error || !user) redirect("/login");
  const { data: profile, error: profileError } = await db
    .from("profiles")
    .select("is_superadmin,first_name,last_name")
    .eq("id", user.id)
    .single();
  if (
    profileError ||
    profile?.is_superadmin !== true ||
    user.app_metadata.provider !== "google"
  )
    redirect("/login?denied=1");
  return { db, user, profile };
}
