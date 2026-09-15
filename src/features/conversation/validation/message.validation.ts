import { z } from "zod";

export const sendMessageSchema = z
  .object({
    clientMessageId: z.string().uuid(),
    text: z.string().optional(),
    replyToMessageId: z.string().uuid().optional(),
    attachmentMediaIds: z.array(z.string().uuid()).optional(),
  })
  .refine(
    (data) =>
      data.text ||
      (data.attachmentMediaIds && data.attachmentMediaIds.length > 0),
    {
      message: "Provide text or at least one attachment",
    },
  );

export const editMessageSchema = z.object({
  text: z.string().nullable(),
  expectedVersion: z.number(),
});

export const setMessageReactionSchema = z.object({
  emoji: z.enum(["👍", "❤️", "😂", "😮", "😢", "🙏"]),
});

export const messageListQuerySchema = z.object({
  limit: z.number().optional(),
  cursor: z.string().optional(),
});

export const searchMessagesQuerySchema = messageListQuerySchema.extend({
  q: z.string().min(1),
});

export const updateReceiptSchema = z.object({
  throughMessageId: z.string().uuid(),
});
