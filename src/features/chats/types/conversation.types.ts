import type { components } from "@/core/types/api";

// ---- Raw DTO Types derived directly from OpenAPI schema ----

export type CreateDirectConversationDto =
  components["schemas"]["CreateDirectConversationDto"];
export type CreateGroupConversationDto =
  components["schemas"]["CreateGroupConversationDto"];
export type UpdateGroupConversationDto =
  components["schemas"]["UpdateGroupConversationDto"];
export type SetGroupAvatarDto = components["schemas"]["SetGroupAvatarDto"];
export type AddGroupMembersDto = components["schemas"]["AddGroupMembersDto"];
export type UpdateGroupMemberRoleDto =
  components["schemas"]["UpdateGroupMemberRoleDto"];
export type TransferGroupOwnershipDto =
  components["schemas"]["TransferGroupOwnershipDto"];
export type UpdateConversationSettingsDto =
  components["schemas"]["UpdateConversationSettingsDto"];
export type MuteConversationDto = components["schemas"]["MuteConversationDto"];

export type ConversationLatestMessageDto =
  components["schemas"]["ConversationLatestMessageDto"];
export type ConversationMemberSettingsDto =
  components["schemas"]["ConversationMemberSettingsDto"];
export type ConversationParticipantDto =
  components["schemas"]["ConversationParticipantDto"];
export type GroupConversationParticipantDto =
  components["schemas"]["GroupConversationParticipantDto"];
export type DirectConversationResponseDto =
  components["schemas"]["DirectConversationResponseDto"];
export type GroupConversationResponseDto =
  components["schemas"]["GroupConversationResponseDto"];
export type DeleteDirectChatResponseDto =
  components["schemas"]["DeleteDirectChatResponseDto"];
export type ConversationPageInfoDto =
  components["schemas"]["ConversationPageInfoDto"];
export type ConversationListResponseDto =
  components["schemas"]["ConversationListResponseDto"];
export type ConversationSettingsResponseDto =
  components["schemas"]["ConversationSettingsResponseDto"];
export type ConversationReadStateResponseDto =
  components["schemas"]["ConversationReadStateResponseDto"];
export type ClearConversationMessagesResponseDto =
  components["schemas"]["ClearConversationMessagesResponseDto"];

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
