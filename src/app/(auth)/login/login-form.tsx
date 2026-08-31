"use client";

import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { Mail, Lock, Eye, EyeOff, LogIn, AlertCircle } from "lucide-react";
import { loginAction, type AuthState } from "../actions";
import { TextField } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const initial: AuthState = {};

export function LoginForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState(loginAction, initial);
  const [showPw, setShowPw] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (state?.error) toast.error(state.error);
  }, [state]);

  function fillDemo(kind: "admin" | "user") {
    setEmail(kind === "admin" ? "admin@maptracker.app" : "demo@maptracker.app");
    setPassword("password123");
  }

  return (
    <form action={action} className="space-y-4">
      {next && <input type="hidden" name="next" value={next} />}

      {state?.error && (
        <div className="flex items-start gap-2 rounded-xl border border-danger/30 bg-danger/10 p-3 text-sm text-danger">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{state.error}</span>
        </div>
      )}

      <TextField
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="you@example.com"
        icon={Mail}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={state?.fieldErrors?.email?.[0]}
        required
      />

      <TextField
        label="Password"
        name="password"
        type={showPw ? "text" : "password"}
        autoComplete="current-password"
        placeholder="••••••••"
        icon={Lock}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={state?.fieldErrors?.password?.[0]}
        required
        trailing={
          <button
            type="button"
            onClick={() => setShowPw((v) => !v)}
            className="grid h-7 w-7 place-items-center rounded-lg text-faint transition-colors hover:text-fg"
            aria-label={showPw ? "Hide password" : "Show password"}
          >
            {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        }
      />

      <Button type="submit" className="w-full" loading={pending}>
        {!pending && <LogIn className="h-4 w-4" />}
        Sign in
      </Button>

      <div className="rounded-xl border border-border bg-surface-2/60 p-3">
        <p className="mb-2 text-xs font-medium text-faint">
          Demo accounts — one click to fill
        </p>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="flex-1"
            onClick={() => fillDemo("admin")}
          >
            Admin
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="flex-1"
            onClick={() => fillDemo("user")}
          >
            Member
          </Button>
        </div>
      </div>
    </form>
  );
}
