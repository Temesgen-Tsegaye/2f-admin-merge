import z from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .email()
    .min(3, "Username must be at least 3 characters long")
    .max(20, "Username must be at most 20 characters long"),
  password: z.string().min(4, "Password must be at least 4 characters long"),
});

export const ChannelSchema = z.object({
  id: z.number().positive(),
  name: z.string().min(1),
});

export const TypeSchema = z.object({
  id: z.number().positive(),
  name: z.string().min(1),
});

export const CategorySchema = z.object({
  id: z.number().positive(),
  name: z.string().min(1),
});

export const ProgramSchema = z.object({
  id: z.number().positive().optional(),
  title: z.string().min(1),
  duration: z.number().positive(),
  description: z.string().min(1),
  videoUrl: z.string().url(),
  released: z.date().optional(),
  status: z.boolean().optional(),
  typeId: z.number(),
  categoryId: z.number(),
  channelId: z.number(),
  channel: ChannelSchema.optional(),
  type: TypeSchema.optional(),
  category: CategorySchema.optional(),
  userId: z.string().optional()
});

export const userSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1).max(20),
  email: z.string().email(),
  password: z.string(),
  roleId: z.number().min(1),
});

export type Program = z.infer<typeof ProgramSchema>;

export const validateProgram = (
  program: Partial<Program>
): Record<string, string | undefined> => {
  try {
    ProgramSchema.parse(program);
    return {};
  } catch (error) {
    if (error instanceof z.ZodError) {
      const validationErrors: Record<string, string | undefined> = {};
      error.errors.forEach((err) => {
        if (err.path) {
          validationErrors[err.path[0]] = err.message;
        }
      });
      return validationErrors;
    }
    return {};
  }
};
