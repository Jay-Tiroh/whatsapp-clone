// features/profile/schema.ts
import { z } from "zod";

export const editProfileSchema = z.object({
  // Renamed from 'name' to 'displayName' to match UpdateProfilePayload
  displayName: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .optional(),
  // Removed 'phone' field entirely, as it's not updatable in the new API spec
});

export type EditProfileFormValues = z.infer<typeof editProfileSchema>;
