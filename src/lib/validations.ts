import { z } from "zod";

// ─── Auth ──────────────────────────────────────────────────────────────────

export const signUpSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(80),
  email: z.string().email("Invalid email address").toLowerCase(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/[0-9]/, "Must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Must contain at least one special character"),
  acceptTerms: z.boolean().refine((v) => v === true, "You must accept the terms"),
});

export const signInSchema = z.object({
  email: z.string().email().toLowerCase(),
  password: z.string().min(1, "Password is required"),
  totp: z.string().optional(),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address").toLowerCase(),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1),
    password: z
      .string()
      .min(8)
      .regex(/[A-Z]/)
      .regex(/[0-9]/)
      .regex(/[^A-Za-z0-9]/),
    confirmPassword: z.string().min(1),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const verifyMFASchema = z.object({
  code: z.string().length(6, "Code must be 6 digits").regex(/^\d+$/, "Digits only"),
});

export const enableMFASchema = z.object({
  code: z.string().length(6).regex(/^\d+$/),
  secret: z.string().min(1),
});

// ─── User / Profile ────────────────────────────────────────────────────────

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(80).optional(),
  company: z.string().max(100).optional(),
  jobTitle: z.string().max(100).optional(),
  timezone: z.string().optional(),
  locale: z.string().optional(),
  // Accept a https URL or a data URL (capped ~2.5MB base64 ≈ 1.8MB image)
  image: z
    .string()
    .max(3_500_000)
    .refine(
      (v) => v.startsWith("data:image/") || /^https?:\/\//.test(v),
      "Invalid image"
    )
    .optional()
    .nullable(),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1),
    newPassword: z
      .string()
      .min(8)
      .regex(/[A-Z]/)
      .regex(/[0-9]/)
      .regex(/[^A-Za-z0-9]/),
    confirmPassword: z.string().min(1),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const deleteAccountSchema = z.object({
  password: z.string().min(1, "Password is required to delete account"),
  confirmation: z.literal("DELETE MY ACCOUNT"),
});

// ─── API Keys ──────────────────────────────────────────────────────────────

export const createApiKeySchema = z.object({
  name: z.string().min(1).max(60),
  scopes: z.array(z.string()).default([]),
  expiresIn: z.enum(["30d", "90d", "1y", "never"]).default("never"),
});

// ─── Billing ───────────────────────────────────────────────────────────────

export const createCheckoutSchema = z.object({
  planSlug: z.enum(["solo", "team", "enterprise"]),
  interval: z.enum(["monthly", "yearly"]),
});

// ─── Workspace ─────────────────────────────────────────────────────────────

export const createWorkspaceSchema = z.object({
  name: z.string().min(2).max(80),
  slug: z
    .string()
    .min(2)
    .max(40)
    .regex(/^[a-z0-9-]+$/, "Only lowercase letters, numbers, and hyphens"),
});

export const inviteMemberSchema = z.object({
  email: z.string().email(),
  role: z.enum(["ADMIN", "MEMBER", "VIEWER"]).default("MEMBER"),
});

// ─── Admin ─────────────────────────────────────────────────────────────────

export const adminUpdateUserSchema = z.object({
  role: z.enum(["USER", "ADMIN", "SUPER_ADMIN"]).optional(),
  status: z.enum(["ACTIVE", "SUSPENDED", "PENDING_VERIFICATION"]).optional(),
});

// ─── Waitlist / Contact ────────────────────────────────────────────────────

export const waitlistSchema = z.object({
  email: z.string().email("Invalid email address"),
  name: z.string().optional(),
  source: z.string().optional(),
});

export const contactSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  subject: z.string().min(4).max(120),
  message: z.string().min(20).max(2000),
});

// ─── Types ─────────────────────────────────────────────────────────────────

export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type CreateApiKeyInput = z.infer<typeof createApiKeySchema>;
