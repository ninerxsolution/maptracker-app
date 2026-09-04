"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { createSession, destroySession } from "@/lib/auth/session";
import { loginSchema, registerSchema } from "@/lib/validators";

export type AuthState = {
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

function safeNext(next: FormDataEntryValue | null): string | null {
  const v = typeof next === "string" ? next : "";
  // Must be a same-origin absolute path. Reject protocol-relative ("//"),
  // backslash tricks ("/\\evil.com"), and control chars / whitespace.
  if (!v.startsWith("/") || v.startsWith("//") || /[\\\x00-\x1f\s]/.test(v)) {
    return null;
  }
  try {
    const url = new URL(v, "https://placeholder.local");
    if (url.origin !== "https://placeholder.local") return null;
    return url.pathname + url.search;
  } catch {
    return null;
  }
}

export async function registerAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const { name, email, password } = parsed.data;

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    return { fieldErrors: { email: ["อีเมลนี้ถูกใช้ลงทะเบียนแล้ว"] } };
  }

  const passwordHash = await hashPassword(password);
  const user = await db.user.create({
    data: { name, email, passwordHash, role: "USER", lastLoginAt: new Date() },
    select: { id: true, email: true, name: true, role: true },
  });

  await createSession({
    sub: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  });

  redirect("/app");
}

export async function loginAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const { email, password } = parsed.data;
  const user = await db.user.findUnique({ where: { email } });

  // Generic message — don't reveal which part was wrong.
  const invalid: AuthState = { error: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" };
  if (!user) return invalid;
  if (user.status === "SUSPENDED") {
    return { error: "บัญชีนี้ถูกระงับการใช้งาน กรุณาติดต่อผู้ดูแลระบบ" };
  }
  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) return invalid;

  await db.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  await createSession({
    sub: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  });

  const next = safeNext(formData.get("next"));
  redirect(next ?? (user.role === "ADMIN" ? "/admin" : "/app"));
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/");
}
