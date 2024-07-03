import { z } from "zod";

export const RoleSchema = z.object({
  name: z.string().min(1, "Role name is required"),
  permissions: z.array(z.number()).min(1, "At least one permission is required"),
});

export type Role = z.infer<typeof RoleSchema>;
