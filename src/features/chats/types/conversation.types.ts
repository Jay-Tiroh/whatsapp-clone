// features/conversations/types/conversation.types.ts

export interface CreateDirectConversationDto {
  participantId: string;
}

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

export interface ConversationListQueryDto {
  limit?: number;
  cursor?: string;
}
