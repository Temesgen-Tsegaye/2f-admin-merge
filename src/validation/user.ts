import { z } from "zod";

export const userSchema = z.object({
    id: z.string().optional(),
  name: z.string().min(1, "Username is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long").optional(),
  roleId: z.number().min(1, "Role is required"),
});

export type User = z.infer<typeof userSchema>;
