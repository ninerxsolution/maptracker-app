import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("กรอกอีเมลให้ถูกต้อง"),
  password: z.string().min(1, "กรุณากรอกรหัสผ่าน"),
});

export const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "ชื่อต้องมีอย่างน้อย 2 ตัวอักษร")
      .max(60, "ชื่อยาวเกินไป"),
    email: z.string().trim().toLowerCase().email("กรอกอีเมลให้ถูกต้อง"),
    password: z
      .string()
      .min(8, "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร")
      .max(100, "รหัสผ่านยาวเกินไป"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "รหัสผ่านไม่ตรงกัน",
    path: ["confirmPassword"],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;

export const zoneSchema = z.object({
  name: z.string().trim().min(1, "กรุณากรอกชื่อ").max(60, "ชื่อยาวเกินไป"),
  centerLat: z.coerce.number().min(-90).max(90),
  centerLng: z.coerce.number().min(-180).max(180),
  radiusKm: z.coerce
    .number()
    .min(10, "รัศมีต้องอย่างน้อย 10 กม.")
    .max(5000, "รัศมีได้ไม่เกิน 5000 กม."),
  minMagnitude: z.coerce.number().min(0).max(10),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, "เลือกสีให้ถูกต้อง")
    .default("#38bdf8"),
});
export type ZoneInput = z.infer<typeof zoneSchema>;

export const bookmarkSchema = z.object({
  eventId: z.string().min(1),
  magnitude: z.number().nullable().optional(),
  place: z.string().nullable().optional(),
  latitude: z.number(),
  longitude: z.number(),
  depthKm: z.number().nullable().optional(),
  occurredAt: z.coerce.date(),
});
export type BookmarkInput = z.infer<typeof bookmarkSchema>;

export const noteSchema = z.string().max(500, "โน้ตยาวได้ไม่เกิน 500 ตัวอักษร");
