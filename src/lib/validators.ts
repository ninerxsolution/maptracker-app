import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

export const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Name must be at least 2 characters.")
      .max(60, "Name is too long."),
    email: z.string().trim().toLowerCase().email("Enter a valid email address."),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters.")
      .max(100, "Password is too long."),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;

export const zoneSchema = z.object({
  name: z.string().trim().min(1, "Name is required.").max(60, "Name is too long."),
  centerLat: z.coerce.number().min(-90).max(90),
  centerLng: z.coerce.number().min(-180).max(180),
  radiusKm: z.coerce
    .number()
    .min(10, "Radius must be at least 10 km.")
    .max(5000, "Radius can be at most 5000 km."),
  minMagnitude: z.coerce.number().min(0).max(10),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, "Pick a valid colour.")
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

export const noteSchema = z
  .string()
  .max(500, "Note can be at most 500 characters.");
