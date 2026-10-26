import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  const db = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll(values) {
          values.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          values.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );
  const {
    data: { user },
  } = await db.auth.getUser();
  const path = request.nextUrl.pathname;
  if (
    path === "/login" ||
    path === "/auth/callback" ||
    path === "/auth/signout"
  )
    return response;
  let allowed = false;
  if (user && user.app_metadata.provider === "google") {
    const { data } = await db
      .from("profiles")
      .select("is_superadmin")
      .eq("id", user.id)
      .single();
    allowed = data?.is_superadmin === true;
  }
  if (!allowed) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = user ? "?denied=1" : "";
    const denied = NextResponse.redirect(url);
    response.cookies.getAll().forEach((c) => denied.cookies.set(c));
    return denied;
  }
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
