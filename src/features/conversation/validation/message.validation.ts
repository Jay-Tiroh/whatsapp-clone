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

export const MESSAGE_SEARCH_MIN_LENGTH = 2;
export const MESSAGE_SEARCH_MAX_LENGTH = 100;

// One source of truth for message-search input rules, shared by the query hook
// and the search UI.
export const messageSearchQuerySchema = z
  .string()
  .trim()
  .min(
    MESSAGE_SEARCH_MIN_LENGTH,
    `Type at least ${MESSAGE_SEARCH_MIN_LENGTH} characters to search.`,
  )
  .max(
    MESSAGE_SEARCH_MAX_LENGTH,
    `Search is limited to ${MESSAGE_SEARCH_MAX_LENGTH} characters.`,
  );

export function normalizeMessageSearchQuery(value: string): string {
  return value.trim();
}

export type MessageSearchQueryValidation =
  | { isValid: true; query: string; message: null }
  | { isValid: false; query: string; message: string };

export function validateMessageSearchQuery(
  value: string,
): MessageSearchQueryValidation {
  const query = normalizeMessageSearchQuery(value);
  const result = messageSearchQuerySchema.safeParse(query);

  if (result.success) {
    return { isValid: true, query: result.data, message: null };
  }

  return {
    isValid: false,
    query,
    message: result.error.issues[0]?.message ?? "Invalid search text.",
  };
}

// API contract: `q` is required and must be non-empty.
export const searchMessagesQuerySchema = messageListQuerySchema.extend({
  q: z.string().trim().min(1),
});

export const updateReceiptSchema = z.object({
  throughMessageId: z.string().uuid(),
});
