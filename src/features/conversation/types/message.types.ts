import type { components } from "@/core/types/api";

// ---- Raw DTO Types derived directly from OpenAPI schema ----

export type SendMessageDto = components["schemas"]["SendMessageDto"];
export type EditMessageDto = components["schemas"]["EditMessageDto"];
export type SetMessageReactionDto =
  components["schemas"]["SetMessageReactionDto"];
export type MessageAttachmentResponseDto =
  components["schemas"]["MessageAttachmentResponseDto"];
export type AudioMessageAttachmentResponseDto =
  components["schemas"]["AudioMessageAttachmentResponseDto"];
export type VideoMessageAttachmentResponseDto =
  components["schemas"]["VideoMessageAttachmentResponseDto"];
export type DocumentMessageAttachmentResponseDto =
  components["schemas"]["DocumentMessageAttachmentResponseDto"];
export type MessageReactionResponseDto =
  components["schemas"]["MessageReactionResponseDto"];
export type MessageResponseDto = components["schemas"]["MessageResponseDto"];
export type MessagePageInfoDto = components["schemas"]["MessagePageInfoDto"];
export type MessageHistoryResponseDto =
  components["schemas"]["MessageHistoryResponseDto"];
export type ConversationReadStateResponseDto =
  components["schemas"]["ConversationReadStateResponseDto"];
export type UpdateReceiptDto = components["schemas"]["UpdateReceiptDto"];
export type ReceiptBoundaryResponseDto =
  components["schemas"]["ReceiptBoundaryResponseDto"];
export type ReceiptUpdateResponseDto =
  components["schemas"]["ReceiptUpdateResponseDto"];
export type ReceiptFrontierResponseDto =
  components["schemas"]["ReceiptFrontierResponseDto"];
export type ReceiptFrontiersResponseDto =
  components["schemas"]["ReceiptFrontiersResponseDto"];
export type ClearConversationMessagesResponseDto =
  components["schemas"]["ClearConversationMessagesResponseDto"];

// ---- Legacy/Convenience Payload Aliases ----

export type SendMessagePayload = SendMessageDto;
export type EditMessagePayload = EditMessageDto;
export type SetMessageReactionPayload = SetMessageReactionDto;
export type UpdateReceiptPayload = UpdateReceiptDto;
export type MessageDto = MessageResponseDto;
export type MessageListResponseDto = MessageHistoryResponseDto;
export type MarkReadResponseDto = ConversationReadStateResponseDto;

export interface MessageListQueryPayload {
  limit?: number;
  cursor?: string;
}

// ---- Application Domain Models ----

export interface MessageAttachment {
  mediaId: string;
  type: "image" | "audio" | "video" | "document";
  contentType: string;
  sizeBytes: number;
  url: string;
  width?: number;
  height?: number;
  durationMs?: number;
  filename?: string;
}

export interface MessageReaction {
  userId: string;
  emoji: string;
}

export interface Message {
  id: string;
  conversationId: string;
  clientMessageId: string;
  senderId: string;
  kind: "text" | "image" | "audio" | "video" | "document";
  text: string | null;
  createdAt: string;
  attachments: MessageAttachment[];
  replyToMessageId: string | null;
  editedAt: string | null;
  deletedAt: string | null;
  version: number;
  reactions: MessageReaction[];
}

export interface PaginatedMessages {
  items: Message[];
  pageInfo: {
    nextCursor: string | null;
    hasNextPage: boolean;
  };
}

export interface ConversationReadStatus {
  conversationId: string;
  lastReadAt: string;
  unreadCount: number;
}

export type ReceiptPayload = {
  conversationId: string;
  userId: string;
  throughMessageId: string;
  at: string;
  version: number;

  delivered: {
    messageId: string;
    at: string;
  } | null;

  read: {
    messageId: string;
    at: string;
  } | null;
};

export type PresencePayload = {
  conversationId: string;
  userId: string;
  status: "online" | "offline";
  occurredAt: string;
};

export type TypingPayload = {
  conversationId: string;
  userId: string;
  expiresAt?: string;
  occurredAt?: string;
};

export type AckResponse<T = unknown> =
  | {
      ok: true;
      data: T;
    }
  | {
      ok: false;
      error: {
        code: string;
        message: string;
      };
    };

export type Options = {
  conversationId: string;
  onMessageCreated?: (message: MessageDto) => void;
  onReceiptDelivered?: (receipt: ReceiptPayload) => void;
  onReceiptRead?: (receipt: ReceiptPayload) => void;
  onPresenceChanged?: (presence: PresencePayload) => void;
  onTypingStarted?: (typing: TypingPayload) => void;
  onTypingStopped?: (typing: TypingPayload) => void;
};
