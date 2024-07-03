import { z } from "zod";

const ChannelSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  status: z.boolean().optional(),
});

export type ChannelData = z.infer<typeof ChannelSchema>;

export const validateChannel = (
  channel: Partial<ChannelData>
): Record<string, string | undefined> => {
  try {
    ChannelSchema.parse(channel);
    return {};
  } catch (error) {
    if (error instanceof z.ZodError) {
      const validationErrors: Record<string, string | undefined> = {};
      error.errors.forEach((err) => {
        if (err.path) {
          validationErrors[err.path[0].toString()] = err.message;
        }
      });
      return validationErrors;
    }
    return {};
  }
};
