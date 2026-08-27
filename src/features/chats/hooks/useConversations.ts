// features/conversations/hooks/useConversations.ts
import { useMutation, useQuery } from "@tanstack/react-query";
import { conversationApi } from "../api/conversation.api";
import type {
  ConversationListQueryDto,
  CreateDirectConversationDto,
} from "../types/conversation.types";

export const useCreateDirectConversation = () => {
  return useMutation({
    mutationFn: (data: CreateDirectConversationDto) =>
      conversationApi.createDirect(data),
  });
};

export const useGetConversations = (params?: ConversationListQueryDto) => {
  return useQuery({
    queryKey: ["conversations", "list", params],
    queryFn: () => conversationApi.getList(params),
  });
};

export const useGetConversationById = (conversationId: string) => {
  return useQuery({
    queryKey: ["conversations", "detail", conversationId],
    queryFn: () => conversationApi.getById(conversationId),
    enabled: !!conversationId, // Prevents query from running if ID is undefined
  });
};
