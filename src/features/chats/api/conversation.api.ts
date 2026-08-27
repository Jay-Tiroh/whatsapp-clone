// features/conversations/api/conversation.api.ts
import { api } from "@/core/lib/api";
import type {
  ConversationListQueryDto,
  ConversationListResponseDto,
  ConversationResponseDto,
  CreateDirectConversationDto,
} from "../types/conversation.types";

export const conversationApi = {
  createDirect: async (
    data: CreateDirectConversationDto,
  ): Promise<ConversationResponseDto> => {
    const response = await api.post<ConversationResponseDto>(
      "/v1/conversations/direct",
      data,
    );
    return response.data;
  },

  getList: async (
    params?: ConversationListQueryDto,
  ): Promise<ConversationListResponseDto> => {
    const response = await api.get<ConversationListResponseDto>(
      "/v1/conversations",
      { params },
    );
    return response.data;
  },

  getById: async (conversationId: string): Promise<ConversationResponseDto> => {
    const response = await api.get<ConversationResponseDto>(
      `/v1/conversations/${conversationId}`,
    );
    return response.data;
  },
};
