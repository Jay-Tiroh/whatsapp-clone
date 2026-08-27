import { api } from "@/core/lib/api";
import type {
  Conversation,
  ConversationListQueryPayload,
  ConversationListResponseDto,
  ConversationResponseDto,
  CreateDirectConversationPayload,
  PaginatedConversations,
} from "../types/conversation.types";

const mapConversation = (dto: ConversationResponseDto): Conversation => ({
  id: dto.id,
  type: dto.type,
  otherParticipant: {
    id: dto.otherParticipant.id,
    displayName: dto.otherParticipant.displayName,
    avatarUrl: dto.otherParticipant.avatarUrl,
  },
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
  lastActivityAt: dto.lastActivityAt,
  createdAt: dto.createdAt,
  updatedAt: dto.updatedAt,
});

const mapPaginatedConversations = (
  dto: ConversationListResponseDto,
): PaginatedConversations => ({
  items: dto.items.map(mapConversation),
  pageInfo: {
    nextCursor: dto.pageInfo.nextCursor,
    hasNextPage: dto.pageInfo.hasNextPage,
  },
});

export const conversationApi = {
  createDirect: async (
    payload: CreateDirectConversationPayload,
  ): Promise<Conversation> => {
    const { data } = await api.post<ConversationResponseDto>(
      "/v1/conversations/direct",
      payload,
    );
    return mapConversation(data);
  },

  getList: async (
    params?: ConversationListQueryPayload,
  ): Promise<PaginatedConversations> => {
    const { data } = await api.get<ConversationListResponseDto>(
      "/v1/conversations",
      { params },
    );
    return mapPaginatedConversations(data);
  },

  getById: async (conversationId: string): Promise<Conversation> => {
    const { data } = await api.get<ConversationResponseDto>(
      `/v1/conversations/${conversationId}`,
    );
    return mapConversation(data);
  },
};
