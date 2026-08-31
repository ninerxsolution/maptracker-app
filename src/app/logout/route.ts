import { NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth/jwt";

// Clears the session cookie and returns to /login. Used both by the
// requireUser/requireAdmin guards (to break the "valid JWT but rejected by the
// DB" redirect loop for suspended/deleted accounts) and as a plain logout link.
export async function GET(req: Request) {
  const res = NextResponse.redirect(new URL("/login", req.url));
  res.cookies.delete(SESSION_COOKIE);
  return res;
}
