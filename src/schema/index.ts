import z from "zod"

export const loginSchema = z.object({
  email: z
    .string()
    .email()
    .min(3, "Username must be at least 3 characters long")
    .max(20, "Username must be at most 20 characters long"),
  password: z.string().min(4, "Password must be at least 4 characters long"),
})
