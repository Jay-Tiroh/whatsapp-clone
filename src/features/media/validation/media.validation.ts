import { z } from "zod";

// Maps to CreateMediaUploadDto
export const createMediaUploadSchema = z.object({
  clientUploadId: z.string().uuid(), // Assuming UUID based on your use of Crypto.randomUUID()
  purpose: z.enum(["profile_avatar", "group_avatar", "message_attachment"]),
  contentType: z.enum([
    "image/jpeg",
    "image/png",
    "image/webp",
    "audio/aac",
    "audio/mp4",
    "audio/m4a",
    "audio/x-m4a",
    "audio/mpeg",
    "audio/ogg",
    "audio/wav",
    "audio/x-wav",
    "video/mp4",
    "video/quicktime",
    "video/webm",
    "application/pdf",
    "text/plain",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ]),
  sizeBytes: z.number().int().nonnegative(),
  contentSha256: z.string().optional(),
  originalFilename: z.string().optional(),
});
