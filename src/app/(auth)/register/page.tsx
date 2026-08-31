import Link from "next/link";
import type { Metadata } from "next";
import { Card } from "@/components/ui/card";
import { RegisterForm } from "./register-form";

export const metadata: Metadata = { title: "Create account" };

export default function RegisterPage() {
  return (
    <Card className="p-7">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold tracking-tight text-fg">
          Create your account
        </h1>
        <p className="mt-1 text-sm text-muted">
          Set up watch zones and start tracking seismic activity.
        </p>
      </div>

      <RegisterForm />

      <p className="mt-6 text-center text-sm text-muted">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </Card>
  );
}
