"use client";

import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import {
  Search,
  ShieldCheck,
  ShieldMinus,
  Ban,
  CircleCheck,
  Trash2,
  X,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RelativeTime } from "@/components/ui/relative-time";
import { setUserRole, setUserStatus, deleteUser } from "../actions";
import { cn } from "@/lib/utils";

export type UserRow = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  zones: number;
  bookmarks: number;
  createdAt: string | Date;
  lastLoginAt: string | Date | null;
};

export function UsersTable({
  initial,
  currentUserId,
}: {
  initial: UserRow[];
  currentUserId: string;
}) {
  const [users, setUsers] = useState(initial);
  const [q, setQ] = useState("");
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return users;
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(s) || u.email.toLowerCase().includes(s),
    );
  }, [users, q]);

  function toggleRole(u: UserRow) {
    const role = u.role === "ADMIN" ? "USER" : "ADMIN";
    startTransition(async () => {
      const res = await setUserRole(u.id, role);
      if (!res.ok) { toast.error(res.error); return; }
      setUsers((xs) => xs.map((x) => (x.id === u.id ? { ...x, role } : x)));
      toast.success(`${u.name} เป็น${role === "ADMIN" ? "ผู้ดูแลระบบ" : "สมาชิก"}แล้ว`);
    });
  }

  function toggleStatus(u: UserRow) {
    const status = u.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    startTransition(async () => {
      const res = await setUserStatus(u.id, status);
      if (!res.ok) { toast.error(res.error); return; }
      setUsers((xs) => xs.map((x) => (x.id === u.id ? { ...x, status } : x)));
      toast.success(
        `${u.name} ${status === "SUSPENDED" ? "ถูกระงับ" : "เปิดใช้งานอีกครั้ง"}แล้ว`,
      );
    });
  }

  function remove(u: UserRow) {
    startTransition(async () => {
      const res = await deleteUser(u.id);
      if (!res.ok) { toast.error(res.error); return; }
      setUsers((xs) => xs.filter((x) => x.id !== u.id));
      setConfirmId(null);
      toast.success(`ลบ ${u.name} แล้ว`);
    });
  }

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="ค้นหาด้วยชื่อหรืออีเมล…"
          className="pl-10"
        />
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-faint">
              <th className="px-4 py-3 font-medium">ผู้ใช้</th>
              <th className="px-4 py-3 font-medium">บทบาท</th>
              <th className="px-4 py-3 font-medium">สถานะ</th>
              <th className="px-4 py-3 font-medium">โซน</th>
              <th className="px-4 py-3 font-medium">ที่บันทึก</th>
              <th className="px-4 py-3 font-medium">เข้าร่วมเมื่อ</th>
              <th className="px-4 py-3 text-right font-medium">การดำเนินการ</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => {
              const isSelf = u.id === currentUserId;
              const confirming = confirmId === u.id;
              return (
                <tr
                  key={u.id}
                  className="border-b border-border/50 last:border-0 hover:bg-surface-2/40"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={u.name} />
                      <div className="min-w-0">
                        <p className="truncate font-medium text-fg">
                          {u.name}
                          {isSelf && (
                            <span className="ml-1.5 text-xs text-faint">(คุณ)</span>
                          )}
                        </p>
                        <p className="truncate text-xs text-faint">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={u.role === "ADMIN" ? "primary" : "default"}>
                      {u.role}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={u.status === "ACTIVE" ? "success" : "danger"}>
                      {u.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 tabular text-muted">{u.zones}</td>
                  <td className="px-4 py-3 tabular text-muted">{u.bookmarks}</td>
                  <td className="px-4 py-3 text-muted">
                    <RelativeTime value={u.createdAt} />
                  </td>
                  <td className="px-4 py-3">
                    {confirming ? (
                      <div className="flex items-center justify-end gap-1.5">
                        <span className="text-xs text-danger">ลบ?</span>
                        <Button
                          size="sm"
                          variant="danger"
                          loading={pending}
                          onClick={() => remove(u)}
                        >
                          ใช่
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setConfirmId(null)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-end gap-1">
                        <IconBtn
                          title={u.role === "ADMIN" ? "ตั้งเป็นสมาชิก" : "ตั้งเป็นผู้ดูแล"}
                          disabled={pending || (isSelf && u.role === "ADMIN")}
                          onClick={() => toggleRole(u)}
                        >
                          {u.role === "ADMIN" ? (
                            <ShieldMinus className="h-4 w-4" />
                          ) : (
                            <ShieldCheck className="h-4 w-4" />
                          )}
                        </IconBtn>
                        <IconBtn
                          title={u.status === "ACTIVE" ? "ระงับ" : "เปิดใช้งานอีกครั้ง"}
                          disabled={pending || isSelf}
                          onClick={() => toggleStatus(u)}
                        >
                          {u.status === "ACTIVE" ? (
                            <Ban className="h-4 w-4" />
                          ) : (
                            <CircleCheck className="h-4 w-4" />
                          )}
                        </IconBtn>
                        <IconBtn
                          title="ลบ"
                          danger
                          disabled={pending || isSelf}
                          onClick={() => setConfirmId(u.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </IconBtn>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="px-4 py-10 text-center text-sm text-muted">
            ไม่พบผู้ใช้ที่ตรงกับ “{q}”
          </p>
        )}
      </div>
      <p className="text-xs text-faint">
        ผู้ใช้ {filtered.length} จาก {users.length} คน
      </p>
    </div>
  );
}

function IconBtn({
  title,
  onClick,
  disabled,
  danger,
  children,
}: {
  title: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      title={title}
      aria-label={title}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "grid h-8 w-8 place-items-center rounded-lg text-muted transition-colors hover:bg-surface-2 disabled:opacity-30",
        danger ? "hover:text-danger" : "hover:text-fg",
      )}
    >
      {children}
    </button>
  );
}
