// ---- Request Payloads ----

export interface SendMessagePayload {
  clientMessageId: string;
  // merged: text was required in existing usage, kept optional per generated spec (to allow attachment-only)
  text?: string;
  // Added from generated spec
  replyToMessageId?: string;
  attachmentMediaIds?: string[];
}

export interface EditMessagePayload {
  text: string | null;
  expectedVersion: number;
}

export interface SetMessageReactionPayload {
  emoji: "👍" | "❤️" | "😂" | "😮" | "😢" | "🙏";
}

export interface MessageListQueryPayload {
  limit?: number;
  cursor?: string;
}

export interface UpdateReceiptPayload {
  throughMessageId: string;
}

// ---- Raw Backend DTOs ----

export interface MessageAttachmentResponseDto {
  mediaId: string;
  type: "image";
  contentType: string;
  sizeBytes: number;
  width: number;
  height: number;
  url: string;
}

export interface AudioMessageAttachmentResponseDto {
  mediaId: string;
  type: "audio";
  contentType: string;
  sizeBytes: number;
  durationMs: number;
  url: string;
}

export interface VideoMessageAttachmentResponseDto {
  mediaId: string;
  contentType: string;
  url: string;
  type: "video";
  sizeBytes: number;
  durationMs: number;
  width: number;
  height: number;
}

export interface DocumentMessageAttachmentResponseDto {
  mediaId: string;
  type: "document";
  contentType: string;
  sizeBytes: number;
  filename: string;
  url: string;
}

export interface MessageReactionResponseDto {
  userId: string;
  emoji: string;
}

// Replaces generated MessageResponseDto to match existing naming
export interface MessageDto {
  id: string;
  conversationId: string;
  clientMessageId: string;
  senderId: string;
  // merged: kind expanded to generated union
  kind: "text" | "image" | "audio" | "video" | "document";
  // merged: text made nullable to support attachment-only messages
  text: string | null;
  createdAt: string;
  // Added from generated spec
  attachments: (
    | MessageAttachmentResponseDto
    | AudioMessageAttachmentResponseDto
    | VideoMessageAttachmentResponseDto
    | DocumentMessageAttachmentResponseDto
  )[];
  replyToMessageId: string | null;
  editedAt: string | null;
  deletedAt: string | null;
  version: number;
  reactions: MessageReactionResponseDto[];
}

export interface MessagePageInfoDto {
  nextCursor: string | null;
  hasNextPage: boolean;
}

export interface MessageListResponseDto {
  items: MessageDto[];
  pageInfo: MessagePageInfoDto;
}

export interface MarkReadResponseDto {
  conversationId: string;
  lastReadAt: string;
  unreadCount: number;
}

export interface ReceiptBoundaryResponseDto {
  messageId: string;
  at: string;
}

export interface ReceiptUpdateResponseDto {
  conversationId: string;
  status: "delivered" | "read";
  throughMessageId: string;
  at: string;
  changed: boolean;
  unreadCount: number;
  version: number;
  delivered: ReceiptBoundaryResponseDto;
  read: ReceiptBoundaryResponseDto | null;
}

export interface ReceiptFrontierResponseDto {
  userId: string;
  version: number;
  delivered: ReceiptBoundaryResponseDto | null;
  read: ReceiptBoundaryResponseDto | null;
}

export interface ReceiptFrontiersResponseDto {
  conversationId: string;
  items: ReceiptFrontierResponseDto[];
}

export interface ClearConversationMessagesResponseDto {
  conversationId: string;
  changed: boolean;
  clearedAt: string | null;
  clearedThroughMessageId: string | null;
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
