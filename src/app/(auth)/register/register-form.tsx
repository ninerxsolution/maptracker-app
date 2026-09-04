"use client";

import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { User, Mail, Lock, Eye, EyeOff, UserPlus, AlertCircle } from "lucide-react";
import { registerAction, type AuthState } from "../actions";
import { TextField } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const initial: AuthState = {};

export function RegisterForm() {
  const [state, action, pending] = useActionState(registerAction, initial);
  const [showPw, setShowPw] = useState(false);

  useEffect(() => {
    if (state?.error) toast.error(state.error);
  }, [state]);

  const pwToggle = (
    <button
      type="button"
      onClick={() => setShowPw((v) => !v)}
      className="grid h-7 w-7 place-items-center rounded-lg text-faint transition-colors hover:text-fg"
      aria-label={showPw ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
    >
      {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
    </button>
  );

  return (
    <form action={action} className="space-y-4">
      {state?.error && (
        <div className="flex items-start gap-2 rounded-xl border border-danger/30 bg-danger/10 p-3 text-sm text-danger">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{state.error}</span>
        </div>
      )}

      <TextField
        label="ชื่อ-นามสกุล"
        name="name"
        type="text"
        autoComplete="name"
        placeholder="Ada Lovelace"
        icon={User}
        error={state?.fieldErrors?.name?.[0]}
        required
      />

      <TextField
        label="อีเมล"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="you@example.com"
        icon={Mail}
        error={state?.fieldErrors?.email?.[0]}
        required
      />

      <TextField
        label="รหัสผ่าน"
        name="password"
        type={showPw ? "text" : "password"}
        autoComplete="new-password"
        placeholder="อย่างน้อย 8 ตัวอักษร"
        icon={Lock}
        error={state?.fieldErrors?.password?.[0]}
        trailing={pwToggle}
        required
      />

      <TextField
        label="ยืนยันรหัสผ่าน"
        name="confirmPassword"
        type={showPw ? "text" : "password"}
        autoComplete="new-password"
        placeholder="กรอกรหัสผ่านอีกครั้ง"
        icon={Lock}
        error={state?.fieldErrors?.confirmPassword?.[0]}
        required
      />

      <Button type="submit" className="w-full" loading={pending}>
        {!pending && <UserPlus className="h-4 w-4" />}
        สร้างบัญชี
      </Button>
    </form>
  );
}
