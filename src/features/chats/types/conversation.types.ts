// ---- Request Payloads ----

export interface CreateDirectConversationPayload {
  participantId: string;
}

export interface ConversationListQueryPayload {
  limit?: number;
  cursor?: string;
}

// ---- Raw Backend DTOs ----

export interface ConversationParticipantDto {
  id: string;
  displayName: string | null;
  avatarUrl: string | null;
}

export interface ConversationLatestMessageDto {
  id: string;
  senderId: string;
  kind: "text";
  preview: string;
  createdAt: string;
}

export interface ConversationResponseDto {
  id: string;
  type: "direct";
  otherParticipant: ConversationParticipantDto;
  latestMessage: ConversationLatestMessageDto | null;
  unreadCount: number;
  lastActivityAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface ConversationPageInfoDto {
  nextCursor: string | null;
  hasNextPage: boolean;
}

export interface ConversationListResponseDto {
  items: ConversationResponseDto[];
  pageInfo: ConversationPageInfoDto;
}

// ---- Application Domain Models ----

export interface Participant {
  id: string;
  displayName: string | null;
  avatarUrl: string | null;
}

export interface Message {
  id: string;
  senderId: string;
  kind: "text";
  preview: string;
  createdAt: string;
}

export interface Conversation {
  id: string;
  type: "direct";
  otherParticipant: Participant;
  latestMessage: Message | null;
  unreadCount: number;
  lastActivityAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedConversations {
  items: Conversation[];
  pageInfo: {
    nextCursor: string | null;
    hasNextPage: boolean;
  };
}
