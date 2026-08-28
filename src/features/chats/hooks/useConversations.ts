import { useMutation, useQuery } from "@tanstack/react-query";
import { conversationApi } from "../api/conversation.api";
import type {
  ConversationListQueryPayload,
  CreateDirectConversationPayload,
} from "../types/conversation.types";

export const useCreateDirectConversation = () => {
  return useMutation({
    mutationFn: (payload: CreateDirectConversationPayload) =>
      conversationApi.createDirect(payload),
  });
};

export const useGetConversations = (params?: ConversationListQueryPayload) => {
  return useQuery({
    queryKey: ["conversations", "list", params],
    queryFn: () => conversationApi.getList(params),
    staleTime: 1000 * 60 * 2,
  });
};

export const useGetConversationById = (conversationId: string) => {
  return useQuery({
    queryKey: ["conversations", "detail", conversationId],
    queryFn: () => conversationApi.getById(conversationId),
    enabled: !!conversationId,
  });
};
