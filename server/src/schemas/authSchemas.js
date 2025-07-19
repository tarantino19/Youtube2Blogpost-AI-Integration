const { z } = require("zod");

// Custom validators using existing regex patterns
const emailSchema = z
  .string()
  .email("Please enter a valid email address")
  .min(1, "Email address is required")
  .transform((val) => val.toLowerCase().trim());

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters long")
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
    "Password must include at least one uppercase letter, one lowercase letter, and one number",
  );

const nameSchema = z
  .string()
  .min(2, "Name must be at least 2 characters")
  .max(50, "Name must be less than 50 characters")
  .regex(
    /^[a-zA-Z\s\-']{2,50}$/,
    "Name can only contain letters, spaces, hyphens, and apostrophes",
  )
  .transform((val) => val.trim());

// Auth schemas
const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: nameSchema,
});

const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

const updateProfileSchema = z
  .object({
    name: nameSchema.optional(),
    email: emailSchema.optional(),
  })
  .refine((data) => data.name || data.email, {
    message: "At least one field (name or email) must be provided",
  });

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: passwordSchema,
});

const deleteAccountSchema = z.object({
  password: z.string().min(1, "Password is required to delete account"),
});

module.exports = {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  changePasswordSchema,
  deleteAccountSchema,
};
