import { NextResponse, type NextRequest } from "next/server";
import { verifyToken, SESSION_COOKIE } from "@/lib/auth/jwt";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const session = await verifyToken(req.cookies.get(SESSION_COOKIE)?.value);

  const isAuthPage = pathname === "/login" || pathname === "/register";
  const isAdminArea = pathname.startsWith("/admin");
  const isAppArea = pathname.startsWith("/app");

  // Signed-in users shouldn't see the auth pages.
  if (isAuthPage) {
    if (session) {
      const dest = session.role === "ADMIN" ? "/admin" : "/app";
      return NextResponse.redirect(new URL(dest, req.url));
    }
    return NextResponse.next();
  }

  // Protected areas require a session; /admin requires the ADMIN role.
  if (isAppArea || isAdminArea) {
    if (!session) {
      const url = new URL("/login", req.url);
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
    if (isAdminArea && session.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/app", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/app/:path*", "/admin/:path*", "/login", "/register"],
};
