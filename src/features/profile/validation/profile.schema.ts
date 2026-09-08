// features/profile/schema.ts
import { z } from "zod";

export const editProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().min(8, "Enter a valid phone number"),
});

export type EditProfileFormValues = z.infer<typeof editProfileSchema>;
