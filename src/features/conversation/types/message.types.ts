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
