// ---- Request Payloads ----
export interface SendMessagePayload {
  clientMessageId: string;
  text: string;
}

export interface MessageListQueryPayload {
  limit?: number;
  cursor?: string;
}

// ---- Raw Backend DTOs ----
export interface MessageDto {
  id: string;
  conversationId: string;
  clientMessageId: string;
  senderId: string;
  kind: "text";
  text: string;
  createdAt: string;
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

// ---- Application Domain Models ----
export interface Message {
  id: string;
  conversationId: string;
  clientMessageId: string;
  senderId: string;
  kind: "text";
  text: string;
  createdAt: string;
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
