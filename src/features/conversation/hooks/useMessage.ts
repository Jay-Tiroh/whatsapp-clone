import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import { messageApi } from "../api/message.api";

import type {
  MessageListQueryPayload,
  SendMessagePayload,
} from "../types/message.types";

export const useSendMessage = (conversationId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SendMessagePayload) =>
      messageApi.send(conversationId, payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["messages", conversationId],
      });

      queryClient.invalidateQueries({
        queryKey: ["conversations", "list"],
      });
    },
  });
};

export const useGetMessages = (
  conversationId: string,
  params?: Omit<MessageListQueryPayload, "cursor">,
) => {
  return useInfiniteQuery({
    queryKey: ["messages", conversationId, "list", params],

    queryFn: ({ pageParam }) =>
      messageApi.getList(conversationId, {
        ...params,
        cursor: pageParam,
      }),

    enabled: Boolean(conversationId),

    staleTime: 30_000,

    initialPageParam: undefined as string | undefined,

    getNextPageParam: (lastPage) => {
      if (!lastPage.pageInfo.hasNextPage) {
        return undefined;
      }

      return lastPage.pageInfo.nextCursor ?? undefined;
    },
  });
};

export const useMarkConversationRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (conversationId: string) => messageApi.markRead(conversationId),

    onSuccess: (_data, conversationId) => {
      queryClient.invalidateQueries({
        queryKey: ["conversations", "detail", conversationId],
      });

      queryClient.invalidateQueries({
        queryKey: ["conversations", "list"],
      });
    },
  });
};
