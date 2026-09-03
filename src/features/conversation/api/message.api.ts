import { api } from "@/core/lib/api";
import type {
  ConversationReadStatus,
  MarkReadResponseDto,
  Message,
  MessageDto,
  MessageListQueryPayload,
  MessageListResponseDto,
  PaginatedMessages,
  SendMessagePayload,
} from "../types/message.types";

const mapMessage = (dto: MessageDto): Message => ({
  id: dto.id,
  conversationId: dto.conversationId,
  clientMessageId: dto.clientMessageId,
  senderId: dto.senderId,
  kind: dto.kind,
  text: dto.text,
  createdAt: dto.createdAt,
});

const mapPaginatedMessages = (
  dto: MessageListResponseDto,
): PaginatedMessages => ({
  items: dto.items.map(mapMessage),
  pageInfo: {
    nextCursor: dto.pageInfo.nextCursor,
    hasNextPage: dto.pageInfo.hasNextPage,
  },
});

const mapReadStatus = (dto: MarkReadResponseDto): ConversationReadStatus => ({
  conversationId: dto.conversationId,
  lastReadAt: dto.lastReadAt,
  unreadCount: dto.unreadCount,
});

export const messageApi = {
  send: async (
    conversationId: string,
    payload: SendMessagePayload,
  ): Promise<Message> => {
    const { data } = await api.post<MessageDto>(
      `/v1/conversations/${conversationId}/messages`,
      payload,
    );
    return mapMessage(data);
  },

  getList: async (
    conversationId: string,
    params?: MessageListQueryPayload,
  ): Promise<PaginatedMessages> => {
    const { data } = await api.get<MessageListResponseDto>(
      `/v1/conversations/${conversationId}/messages`,
      { params },
    );
    return mapPaginatedMessages(data);
  },

  markRead: async (conversationId: string): Promise<ConversationReadStatus> => {
    const { data } = await api.post<MarkReadResponseDto>(
      `/v1/conversations/${conversationId}/read`,
    );
    return mapReadStatus(data);
  },
};
