// ---- Request Payloads (DTOs) ----

export interface CreateDirectConversationDto {
  participantId: string;
}

export interface CreateGroupConversationDto {
  name: string;
  participantIds: string[];
  avatarMediaId?: string | null;
}

export interface UpdateGroupConversationDto {
  name?: string;
  avatarMediaId?: string | null;
}

export interface SetGroupAvatarDto {
  mediaId: string;
}

export interface AddGroupMembersDto {
  participantIds: string[];
}

export interface UpdateGroupMemberRoleDto {
  role: "admin" | "member";
}

export interface TransferGroupOwnershipDto {
  newOwnerId: string;
}

export interface UpdateConversationSettingsDto {
  archived?: boolean;
  muted?: boolean;
  pinned?: boolean;
}

export interface MuteConversationDto {
  duration: "8_hours" | "24_hours" | "7_days" | "always";
}

// ---- Response DTOs ----

export interface ConversationLatestMessageDto {
  id: string;
  senderId: string;
  kind: "text" | "image" | "audio" | "video" | "document";
  preview: string;
  createdAt: string;
}

export interface ConversationMemberSettingsDto {
  archived: boolean;
  muted: boolean;
  pinned: boolean;
  favorited: boolean;
  archivedAt: string | null;
  mutedAt: string | null;
  mutedUntil: string | null;
  pinnedAt: string | null;
  favoritedAt: string | null;
  clearedAt: string | null;
  clearedThroughMessageId: string | null;
}

export interface ConversationParticipantDto {
  id: string;
  displayName: Record<string, never> | null;
  avatarUrl: string | null;
}

export interface GroupConversationParticipantDto {
  id: string;
  displayName: Record<string, never> | null;
  avatarUrl: string | null;
  role: "owner" | "admin" | "member";
}

export interface DirectConversationResponseDto {
  id: string;
  latestMessage: ConversationLatestMessageDto | null;
  unreadCount: number;
  settings: ConversationMemberSettingsDto;
  lastActivityAt: string;
  createdAt: string;
  updatedAt: string;
  type: "direct";
  otherParticipant: ConversationParticipantDto;
}

export interface GroupConversationResponseDto {
  id: string;
  latestMessage: ConversationLatestMessageDto | null;
  unreadCount: number;
  settings: ConversationMemberSettingsDto;
  lastActivityAt: string;
  createdAt: string;
  updatedAt: string;
  type: "group";
  name: string;
  avatarUrl: string | null;
  participants: GroupConversationParticipantDto[];
  role: "owner" | "admin" | "member";
}

export interface ConversationPageInfoDto {
  nextCursor: Record<string, never> | null;
  hasNextPage: boolean;
}

export interface ConversationListResponseDto {
  items: (DirectConversationResponseDto | GroupConversationResponseDto)[];
  pageInfo: ConversationPageInfoDto;
}

export interface ConversationSettingsResponseDto {
  conversationId: string;
  archived: boolean;
  muted: boolean;
  pinned: boolean;
  favorited: boolean;
  archivedAt: string | null;
  mutedAt: string | null;
  mutedUntil: string | null;
  pinnedAt: string | null;
  favoritedAt: string | null;
  clearedAt: string | null;
  clearedThroughMessageId: string | null;
}

export interface ConversationReadStateResponseDto {
  conversationId: string;
  lastReadAt: string;
  unreadCount: number;
}

export interface ClearConversationMessagesResponseDto {
  conversationId: string;
  changed: boolean;
  clearedAt: string | null;
  clearedThroughMessageId: string | null;
}

// ---- Application Domain Models ----

export interface Participant {
  id: string;
  displayName: string | null;
  avatarUrl: string | null;
}

export interface GroupParticipant extends Participant {
  role: "owner" | "admin" | "member";
}

export interface Message {
  id: string;
  senderId: string;
  kind: "text" | "image" | "audio" | "video" | "document";
  preview: string;
  createdAt: string;
}

export interface BaseConversation {
  id: string;
  latestMessage: Message | null;
  unreadCount: number;
  lastActivityAt: string;
  createdAt: string;
  updatedAt: string;
  settings: ConversationMemberSettingsDto;
}

export interface DirectConversation extends BaseConversation {
  type: "direct";
  otherParticipant: Participant;
}

export interface GroupConversation extends BaseConversation {
  type: "group";
  name: string;
  avatarUrl: string | null;
  participants: GroupParticipant[];
  role: "owner" | "admin" | "member";
}

export type Conversation = DirectConversation | GroupConversation;

export interface PaginatedConversations {
  items: Conversation[];
  pageInfo: {
    nextCursor: string | null;
    hasNextPage: boolean;
  };
}
