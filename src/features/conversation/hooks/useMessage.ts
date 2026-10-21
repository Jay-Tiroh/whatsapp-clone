import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { messageApi, receiptApi } from "../api/message.api";

import type {
  EditMessagePayload,
  MessageListQueryPayload,
  SendMessagePayload,
  SetMessageReactionPayload,
  UpdateReceiptPayload,
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
        cursor: pageParam as string | undefined,
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

export const useSearchMessages = (
  conversationId: string,
  q: string,
  params?: Omit<MessageListQueryPayload, "cursor">,
) => {
  return useInfiniteQuery({
    queryKey: ["messages", conversationId, "search", q, params],

    queryFn: ({ pageParam }) =>
      messageApi.search(conversationId, {
        ...params,
        q,
        cursor: pageParam as string | undefined,
      }),

    enabled: Boolean(conversationId) && Boolean(q),

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

export const useGetMessage = (conversationId: string, messageId: string) => {
  return useQuery({
    queryKey: ["messages", conversationId, "detail", messageId],
    queryFn: () => messageApi.get(conversationId, messageId),
    enabled: Boolean(conversationId) && Boolean(messageId),
  });
};

export const useDeleteMessage = (conversationId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (messageId: string) =>
      messageApi.delete(conversationId, messageId),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["messages", conversationId],
      });
    },
  });
};

export const useEditMessage = (conversationId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      messageId,
      payload,
    }: {
      messageId: string;
      payload: EditMessagePayload;
    }) => messageApi.edit(conversationId, messageId, payload),

    onSuccess: (updatedMessage) => {
      queryClient.invalidateQueries({
        queryKey: ["messages", conversationId],
      });
      queryClient.invalidateQueries({
        queryKey: ["messages", conversationId, "detail", updatedMessage.id],
      });
    },
  });
};

export const useReactToMessage = (conversationId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      messageId,
      payload,
    }: {
      messageId: string;
      payload: SetMessageReactionPayload;
    }) => messageApi.react(conversationId, messageId, payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["messages", conversationId],
      });
    },
  });
};

export const useUnreactToMessage = (conversationId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (messageId: string) =>
      messageApi.unreact(conversationId, messageId),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["messages", conversationId],
      });
    },
  });
};

export const useClearMessages = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (conversationId: string) => messageApi.clear(conversationId),

    onSuccess: (_data, conversationId) => {
      queryClient.invalidateQueries({
        queryKey: ["messages", conversationId],
      });
      queryClient.invalidateQueries({
        queryKey: ["conversations", "detail", conversationId],
      });
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

export const useMarkReceiptDelivered = (conversationId: string) => {
  return useMutation({
    mutationFn: (payload: UpdateReceiptPayload) =>
      receiptApi.markDelivered(conversationId, payload),
  });
};

export const useMarkReceiptRead = (conversationId: string) => {
  return useMutation({
    mutationFn: (payload: UpdateReceiptPayload) =>
      receiptApi.markRead(conversationId, payload),
  });
};

export const useGetReceiptFrontiers = (conversationId: string) => {
  return useQuery({
    queryKey: ["receipts", conversationId, "frontiers"],
    queryFn: () => receiptApi.getFrontiers(conversationId),
    enabled: Boolean(conversationId),
  });
};
