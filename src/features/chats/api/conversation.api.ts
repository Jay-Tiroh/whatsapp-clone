import { api } from "@/core/lib/api";
import type {
  AddGroupMembersDto,
  ClearConversationMessagesResponseDto,
  ConversationListResponseDto,
  ConversationSettingsResponseDto,
  CreateDirectConversationDto,
  CreateGroupConversationDto,
  DirectConversationResponseDto,
  GroupConversationResponseDto,
  MuteConversationDto,
  SetGroupAvatarDto,
  TransferGroupOwnershipDto,
  UpdateConversationSettingsDto,
  UpdateGroupConversationDto,
  UpdateGroupMemberRoleDto,
} from "../types/conversation.types";

// ---- Application Domain Models ----
// (Assuming these are defined in your conversation.types.ts but updated here for clarity on the expected mapped output)
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
  settings: any; // Mapped settings
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

// ---- Mappers ----

const mapConversation = (
  dto: DirectConversationResponseDto | GroupConversationResponseDto,
): Conversation => {
  const base: BaseConversation = {
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
        displayName: dto.otherParticipant.displayName as unknown as
          string | null,
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
      displayName: p.displayName as unknown as string | null,
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
    nextCursor: (dto.pageInfo.nextCursor as unknown as string) || null,
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

  // NEW
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

  // NEW
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

  // NEW
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

  // NEW
  deleteGroup: async (conversationId: string): Promise<void> => {
    await api.delete(`/v1/conversations/${conversationId}`);
  },

  // NEW
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

  // NEW
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

  // NEW
  clearGroupAvatar: async (conversationId: string): Promise<Conversation> => {
    const { data } = await api.delete<GroupConversationResponseDto>(
      `/v1/conversations/${conversationId}/avatar`,
    );
    return mapConversation(data);
  },

  // NEW
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

  // NEW
  removeGroupMember: async (
    conversationId: string,
    memberId: string,
  ): Promise<void> => {
    await api.delete(`/v1/conversations/${conversationId}/members/${memberId}`);
  },

  // NEW
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

  // NEW
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

  // NEW
  leaveGroup: async (conversationId: string): Promise<void> => {
    await api.post(`/v1/conversations/${conversationId}/leave`);
  },

  // NEW
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

  // NEW
  archive: async (
    conversationId: string,
  ): Promise<ConversationSettingsResponseDto> => {
    const { data } = await api.put<ConversationSettingsResponseDto>(
      `/v1/conversations/${conversationId}/archive`,
    );
    return data;
  },

  // NEW
  unarchive: async (
    conversationId: string,
  ): Promise<ConversationSettingsResponseDto> => {
    const { data } = await api.delete<ConversationSettingsResponseDto>(
      `/v1/conversations/${conversationId}/archive`,
    );
    return data;
  },

  // NEW
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

  // NEW
  unmute: async (
    conversationId: string,
  ): Promise<ConversationSettingsResponseDto> => {
    const { data } = await api.delete<ConversationSettingsResponseDto>(
      `/v1/conversations/${conversationId}/mute`,
    );
    return data;
  },

  // NEW
  favorite: async (
    conversationId: string,
  ): Promise<ConversationSettingsResponseDto> => {
    const { data } = await api.put<ConversationSettingsResponseDto>(
      `/v1/conversations/${conversationId}/favorite`,
    );
    return data;
  },

  // NEW
  unfavorite: async (
    conversationId: string,
  ): Promise<ConversationSettingsResponseDto> => {
    const { data } = await api.delete<ConversationSettingsResponseDto>(
      `/v1/conversations/${conversationId}/favorite`,
    );
    return data;
  },

  // NEW
  pin: async (
    conversationId: string,
  ): Promise<ConversationSettingsResponseDto> => {
    const { data } = await api.put<ConversationSettingsResponseDto>(
      `/v1/conversations/${conversationId}/pin`,
    );
    return data;
  },

  // NEW
  unpin: async (
    conversationId: string,
  ): Promise<ConversationSettingsResponseDto> => {
    const { data } = await api.delete<ConversationSettingsResponseDto>(
      `/v1/conversations/${conversationId}/pin`,
    );
    return data;
  },

  // NEW
  clearMessages: async (
    conversationId: string,
  ): Promise<ClearConversationMessagesResponseDto> => {
    const { data } = await api.delete<ClearConversationMessagesResponseDto>(
      `/v1/conversations/${conversationId}/messages`,
    );
    return data;
  },
};
