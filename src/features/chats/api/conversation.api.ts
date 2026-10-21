import { api } from "@/core/lib/api";
import type {
  AddGroupMembersDto,
  ClearConversationMessagesResponseDto,
  Conversation,
  ConversationListResponseDto,
  ConversationReadStateResponseDto,
  ConversationSettingsResponseDto,
  CreateDirectConversationDto,
  CreateGroupConversationDto,
  DeleteDirectChatResponseDto,
  DirectConversation,
  DirectConversationResponseDto,
  GroupConversation,
  GroupConversationResponseDto,
  MuteConversationDto,
  PaginatedConversations,
  SetGroupAvatarDto,
  TransferGroupOwnershipDto,
  UpdateConversationSettingsDto,
  UpdateGroupConversationDto,
  UpdateGroupMemberRoleDto,
} from "../types/conversation.types";

// ---- Mappers ----

const mapConversation = (
  dto: DirectConversationResponseDto | GroupConversationResponseDto,
): Conversation => {
  const base = {
    id: dto.id,
    latestMessage: dto.latestMessage
      ? {
          id: dto.latestMessage.id,
          senderId: dto.latestMessage.senderId,
          kind: dto.latestMessage.kind,
          preview: dto.latestMessage.preview,
          createdAt: dto.latestMessage.createdAt,
        }
      : null,
    unreadCount: dto.unreadCount,
    settings: dto.settings,
    lastActivityAt: dto.lastActivityAt,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
  };

  if (dto.type === "direct") {
    return {
      ...base,
      type: "direct",
      otherParticipant: {
        id: dto.otherParticipant.id,
        displayName:
          typeof dto.otherParticipant.displayName === "string"
            ? dto.otherParticipant.displayName
            : null,
        avatarUrl: dto.otherParticipant.avatarUrl,
      },
    } as DirectConversation;
  }

  return {
    ...base,
    type: "group",
    name: dto.name,
    avatarUrl: dto.avatarUrl,
    role: dto.role,
    participants: dto.participants.map((p) => ({
      id: p.id,
      displayName: typeof p.displayName === "string" ? p.displayName : null,
      avatarUrl: p.avatarUrl,
      role: p.role,
    })),
  } as GroupConversation;
};

const mapPaginatedConversations = (
  dto: ConversationListResponseDto,
): PaginatedConversations => ({
  items: dto.items.map(mapConversation),
  pageInfo: {
    nextCursor:
      typeof dto.pageInfo.nextCursor === "string"
        ? dto.pageInfo.nextCursor
        : null,
    hasNextPage: dto.pageInfo.hasNextPage,
  },
});

// ---- API Service ----

export const conversationApi = {
  createDirect: async (
    payload: CreateDirectConversationDto,
  ): Promise<Conversation> => {
    const { data } = await api.post<DirectConversationResponseDto>(
      "/v1/conversations/direct",
      payload,
    );
    return mapConversation(data);
  },

  createGroup: async (
    payload: CreateGroupConversationDto,
  ): Promise<Conversation> => {
    const { data } = await api.post<GroupConversationResponseDto>(
      "/v1/conversations/group",
      payload,
    );
    return mapConversation(data);
  },

  getList: async (params?: {
    limit?: number;
    cursor?: string;
    archived?: boolean;
  }): Promise<PaginatedConversations> => {
    const { data } = await api.get<ConversationListResponseDto>(
      "/v1/conversations",
      { params },
    );
    return mapPaginatedConversations(data);
  },

  getListArchived: async (params?: {
    limit?: number;
    cursor?: string;
  }): Promise<PaginatedConversations> => {
    const { data } = await api.get<ConversationListResponseDto>(
      "/v1/conversations/archived",
      { params },
    );
    return mapPaginatedConversations(data);
  },

  getListFavorites: async (params?: {
    limit?: number;
    cursor?: string;
    archived?: boolean;
  }): Promise<PaginatedConversations> => {
    const { data } = await api.get<ConversationListResponseDto>(
      "/v1/conversations/favorites",
      { params },
    );
    return mapPaginatedConversations(data);
  },

  getById: async (conversationId: string): Promise<Conversation> => {
    const { data } = await api.get<
      DirectConversationResponseDto | GroupConversationResponseDto
    >(`/v1/conversations/${conversationId}`);
    return mapConversation(data);
  },

  deleteGroup: async (conversationId: string): Promise<void> => {
    await api.delete(`/v1/conversations/${conversationId}`);
  },

  updateGroup: async (
    conversationId: string,
    payload: UpdateGroupConversationDto,
  ): Promise<Conversation> => {
    const { data } = await api.patch<GroupConversationResponseDto>(
      `/v1/conversations/${conversationId}`,
      payload,
    );
    return mapConversation(data);
  },

  setGroupAvatar: async (
    conversationId: string,
    payload: SetGroupAvatarDto,
  ): Promise<Conversation> => {
    const { data } = await api.put<GroupConversationResponseDto>(
      `/v1/conversations/${conversationId}/avatar`,
      payload,
    );
    return mapConversation(data);
  },

  clearGroupAvatar: async (conversationId: string): Promise<Conversation> => {
    const { data } = await api.delete<GroupConversationResponseDto>(
      `/v1/conversations/${conversationId}/avatar`,
    );
    return mapConversation(data);
  },

  addGroupMembers: async (
    conversationId: string,
    payload: AddGroupMembersDto,
  ): Promise<Conversation> => {
    const { data } = await api.post<GroupConversationResponseDto>(
      `/v1/conversations/${conversationId}/members`,
      payload,
    );
    return mapConversation(data);
  },

  removeGroupMember: async (
    conversationId: string,
    memberId: string,
  ): Promise<void> => {
    await api.delete(`/v1/conversations/${conversationId}/members/${memberId}`);
  },

  updateGroupMemberRole: async (
    conversationId: string,
    memberId: string,
    payload: UpdateGroupMemberRoleDto,
  ): Promise<Conversation> => {
    const { data } = await api.patch<GroupConversationResponseDto>(
      `/v1/conversations/${conversationId}/members/${memberId}/role`,
      payload,
    );
    return mapConversation(data);
  },

  transferGroupOwnership: async (
    conversationId: string,
    payload: TransferGroupOwnershipDto,
  ): Promise<Conversation> => {
    const { data } = await api.post<GroupConversationResponseDto>(
      `/v1/conversations/${conversationId}/transfer-ownership`,
      payload,
    );
    return mapConversation(data);
  },

  leaveGroup: async (conversationId: string): Promise<void> => {
    await api.post(`/v1/conversations/${conversationId}/leave`);
  },

  deleteForMe: async (
    conversationId: string,
  ): Promise<DeleteDirectChatResponseDto> => {
    const { data } = await api.delete<DeleteDirectChatResponseDto>(
      `/v1/conversations/${conversationId}/for-me`,
    );
    return data;
  },

  updateSettings: async (
    conversationId: string,
    payload: UpdateConversationSettingsDto,
  ): Promise<ConversationSettingsResponseDto> => {
    const { data } = await api.patch<ConversationSettingsResponseDto>(
      `/v1/conversations/${conversationId}/settings`,
      payload,
    );
    return data;
  },

  archive: async (
    conversationId: string,
  ): Promise<ConversationSettingsResponseDto> => {
    const { data } = await api.put<ConversationSettingsResponseDto>(
      `/v1/conversations/${conversationId}/archive`,
    );
    return data;
  },

  unarchive: async (
    conversationId: string,
  ): Promise<ConversationSettingsResponseDto> => {
    const { data } = await api.delete<ConversationSettingsResponseDto>(
      `/v1/conversations/${conversationId}/archive`,
    );
    return data;
  },

  mute: async (
    conversationId: string,
    payload: MuteConversationDto,
  ): Promise<ConversationSettingsResponseDto> => {
    const { data } = await api.put<ConversationSettingsResponseDto>(
      `/v1/conversations/${conversationId}/mute`,
      payload,
    );
    return data;
  },

  unmute: async (
    conversationId: string,
  ): Promise<ConversationSettingsResponseDto> => {
    const { data } = await api.delete<ConversationSettingsResponseDto>(
      `/v1/conversations/${conversationId}/mute`,
    );
    return data;
  },

  favorite: async (
    conversationId: string,
  ): Promise<ConversationSettingsResponseDto> => {
    const { data } = await api.put<ConversationSettingsResponseDto>(
      `/v1/conversations/${conversationId}/favorite`,
    );
    return data;
  },

  unfavorite: async (
    conversationId: string,
  ): Promise<ConversationSettingsResponseDto> => {
    const { data } = await api.delete<ConversationSettingsResponseDto>(
      `/v1/conversations/${conversationId}/favorite`,
    );
    return data;
  },

  pin: async (
    conversationId: string,
  ): Promise<ConversationSettingsResponseDto> => {
    const { data } = await api.put<ConversationSettingsResponseDto>(
      `/v1/conversations/${conversationId}/pin`,
    );
    return data;
  },

  unpin: async (
    conversationId: string,
  ): Promise<ConversationSettingsResponseDto> => {
    const { data } = await api.delete<ConversationSettingsResponseDto>(
      `/v1/conversations/${conversationId}/pin`,
    );
    return data;
  },

  clearMessages: async (
    conversationId: string,
  ): Promise<ClearConversationMessagesResponseDto> => {
    const { data } = await api.delete<ClearConversationMessagesResponseDto>(
      `/v1/conversations/${conversationId}/messages`,
    );
    return data;
  },

  markRead: async (
    conversationId: string,
  ): Promise<ConversationReadStateResponseDto> => {
    const { data } = await api.post<ConversationReadStateResponseDto>(
      `/v1/conversations/${conversationId}/read`,
    );
    return data;
  },
};
