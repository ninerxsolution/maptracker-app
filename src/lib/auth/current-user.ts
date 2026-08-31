import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getSession } from "./session";

export type CurrentUser = {
  id: string;
  email: string;
  name: string;
  role: string;
  status: string;
};

/**
 * Resolve the signed-in user from the session cookie, verified against the DB
 * (so a suspended/deleted account is rejected immediately). Memoized per request.
 */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const session = await getSession();
  if (!session) return null;

  const user = await db.user.findUnique({
    where: { id: session.sub },
    select: { id: true, email: true, name: true, role: true, status: true },
  });

  if (!user || user.status === "SUSPENDED") return null;
  return user;
});

export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  // A null user here means the cookie is present but invalid (suspended/deleted).
  // Route through /logout to clear it and avoid a middleware redirect loop.
  if (!user) redirect("/logout");
  return user;
}

export async function requireAdmin(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/logout");
  if (user.role !== "ADMIN") redirect("/app");
  return user;
}
