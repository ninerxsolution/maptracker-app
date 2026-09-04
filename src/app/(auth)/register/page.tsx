import Link from "next/link";
import type { Metadata } from "next";
import { Card } from "@/components/ui/card";
import { RegisterForm } from "./register-form";

export const metadata: Metadata = { title: "สร้างบัญชี" };

export default function RegisterPage() {
  return (
    <Card className="p-7">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold tracking-tight text-fg">
          สร้างบัญชีของคุณ
        </h1>
        <p className="mt-1 text-sm text-muted">
          ตั้งค่าโซนเฝ้าระวังและเริ่มติดตามกิจกรรมแผ่นดินไหว
        </p>
      </div>

      <RegisterForm />

      <p className="mt-6 text-center text-sm text-muted">
        มีบัญชีอยู่แล้ว?{" "}
        <Link
          href="/login"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          เข้าสู่ระบบ
        </Link>
      </p>
    </Card>
  );
}
