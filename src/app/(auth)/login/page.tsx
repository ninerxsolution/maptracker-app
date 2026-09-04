import Link from "next/link";
import type { Metadata } from "next";
import { Card } from "@/components/ui/card";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "เข้าสู่ระบบ" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <Card className="p-7">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold tracking-tight text-fg">
          ยินดีต้อนรับกลับ
        </h1>
        <p className="mt-1 text-sm text-muted">
          เข้าสู่ระบบเพื่อไปยังแดชบอร์ด MapTracker ของคุณ
        </p>
      </div>

      <LoginForm next={next} />

      <p className="mt-6 text-center text-sm text-muted">
        เพิ่งเริ่มใช้ MapTracker?{" "}
        <Link
          href="/register"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          สร้างบัญชี
        </Link>
      </p>
    </Card>
  );
}
