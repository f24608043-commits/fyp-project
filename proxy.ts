import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function proxy(request: NextRequest) {
  // Allow public access to marketing and auth pages
  const isPublicPath = request.nextUrl.pathname === "/" ||
                      request.nextUrl.pathname.startsWith("/sign-in") ||
                      request.nextUrl.pathname.startsWith("/sign-up") ||
                      request.nextUrl.pathname.startsWith("/onboarding");

  if (isPublicPath) {
    return NextResponse.next();
  }

  const { supabaseResponse } = await updateSession(request);
  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
