import { api } from "@/core/lib/api";
import type {
  ClearConversationMessagesResponseDto,
  ConversationReadStatus,
  EditMessagePayload,
  MarkReadResponseDto,
  Message,
  MessageAttachment,
  MessageDto,
  MessageListQueryPayload,
  MessageListResponseDto,
  PaginatedMessages,
  ReceiptFrontiersResponseDto,
  ReceiptUpdateResponseDto,
  SendMessagePayload,
  SetMessageReactionPayload,
  UpdateReceiptPayload,
} from "../types/message.types";

const mapAttachment = (
  attachment: MessageDto["attachments"][number],
): MessageAttachment => ({
  mediaId: attachment.mediaId,
  type: attachment.type,
  contentType: attachment.contentType,
  sizeBytes: attachment.sizeBytes,
  url: attachment.url,
  width: "width" in attachment ? attachment.width : undefined,
  height: "height" in attachment ? attachment.height : undefined,
  durationMs: "durationMs" in attachment ? attachment.durationMs : undefined,
  filename: "filename" in attachment ? attachment.filename : undefined,
});

export const mapMessage = (dto: MessageDto): Message => ({
  id: dto.id,
  conversationId: dto.conversationId,
  clientMessageId: dto.clientMessageId,
  senderId: dto.senderId,
  kind: dto.kind,
  text: dto.text,
  createdAt: dto.createdAt,
  attachments: dto.attachments.map(mapAttachment),
  replyToMessageId: dto.replyToMessageId,
  editedAt: dto.editedAt,
  deletedAt: dto.deletedAt,
  version: dto.version,
  reactions: dto.reactions,
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

  // NEW: Search visible message text and captions
  search: async (
    conversationId: string,
    params: MessageListQueryPayload & { q: string },
  ): Promise<PaginatedMessages> => {
    const { data } = await api.get<MessageListResponseDto>(
      `/v1/conversations/${conversationId}/messages/search`,
      { params },
    );
    return mapPaginatedMessages(data);
  },

  // NEW: Get one visible message
  get: async (conversationId: string, messageId: string): Promise<Message> => {
    const { data } = await api.get<MessageDto>(
      `/v1/conversations/${conversationId}/messages/${messageId}`,
    );
    return mapMessage(data);
  },

  // NEW: Delete your own message
  delete: async (
    conversationId: string,
    messageId: string,
  ): Promise<Message> => {
    const { data } = await api.delete<MessageDto>(
      `/v1/conversations/${conversationId}/messages/${messageId}`,
    );
    return mapMessage(data);
  },

  // NEW: Edit your own message text or attachment caption
  edit: async (
    conversationId: string,
    messageId: string,
    payload: EditMessagePayload,
  ): Promise<Message> => {
    const { data } = await api.patch<MessageDto>(
      `/v1/conversations/${conversationId}/messages/${messageId}`,
      payload,
    );
    return mapMessage(data);
  },

  // NEW: Set or replace your reaction
  react: async (
    conversationId: string,
    messageId: string,
    payload: SetMessageReactionPayload,
  ): Promise<Message> => {
    const { data } = await api.put<MessageDto>(
      `/v1/conversations/${conversationId}/messages/${messageId}/reaction`,
      payload,
    );
    return mapMessage(data);
  },

  // NEW: Remove your reaction
  unreact: async (
    conversationId: string,
    messageId: string,
  ): Promise<Message> => {
    const { data } = await api.delete<MessageDto>(
      `/v1/conversations/${conversationId}/messages/${messageId}/reaction`,
    );
    return mapMessage(data);
  },

  // NEW: Clear the caller's message history for a conversation
  clear: async (
    conversationId: string,
  ): Promise<ClearConversationMessagesResponseDto> => {
    const { data } = await api.delete<ClearConversationMessagesResponseDto>(
      `/v1/conversations/${conversationId}/messages`,
    );
    return data;
  },

  markRead: async (conversationId: string): Promise<ConversationReadStatus> => {
    const { data } = await api.post<MarkReadResponseDto>(
      `/v1/conversations/${conversationId}/read`,
    );
    return mapReadStatus(data);
  },
};

export const receiptApi = {
  markDelivered: async (
    conversationId: string,
    payload: UpdateReceiptPayload,
  ): Promise<ReceiptUpdateResponseDto> => {
    const { data } = await api.put<ReceiptUpdateResponseDto>(
      `/v1/conversations/${conversationId}/receipts/delivered`,
      payload,
    );
    return data;
  },

  markRead: async (
    conversationId: string,
    payload: UpdateReceiptPayload,
  ): Promise<ReceiptUpdateResponseDto> => {
    const { data } = await api.put<ReceiptUpdateResponseDto>(
      `/v1/conversations/${conversationId}/receipts/read`,
      payload,
    );
    return data;
  },

  getFrontiers: async (
    conversationId: string,
  ): Promise<ReceiptFrontiersResponseDto> => {
    const { data } = await api.get<ReceiptFrontiersResponseDto>(
      `/v1/conversations/${conversationId}/receipts`,
    );
    return data;
  },
};
