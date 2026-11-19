import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { useDebouncedValue } from "@/shared/hooks/useDebouncedValue";

import { messageApi } from "../api/message.api";
import {
  normalizeMessageSearchQuery,
  validateMessageSearchQuery,
} from "../validation/message.validation";

import type {
  EditMessagePayload,
  MessageListQueryPayload,
  SendMessagePayload,
  SetMessageReactionPayload,
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

export const MESSAGE_SEARCH_DEBOUNCE_MS = 300;

export const useSearchMessages = (
  conversationId: string,
  q: string,
  params?: Omit<MessageListQueryPayload, "cursor">,
) => {
  const debouncedQuery = useDebouncedValue(
    normalizeMessageSearchQuery(q),
    MESSAGE_SEARCH_DEBOUNCE_MS,
  );

  const validation = validateMessageSearchQuery(debouncedQuery);

  const query = useInfiniteQuery({
    queryKey: ["messages", conversationId, "search", validation.query, params],

    queryFn: ({ pageParam }) =>
      messageApi.search(conversationId, {
        ...params,
        q: validation.query,
        cursor: pageParam as string | undefined,
      }),

    enabled: Boolean(conversationId) && validation.isValid,

    staleTime: 30_000,

    initialPageParam: undefined as string | undefined,

    getNextPageParam: (lastPage) => {
      if (!lastPage.pageInfo.hasNextPage) {
        return undefined;
      }
      return lastPage.pageInfo.nextCursor ?? undefined;
    },
  });

  return {
    ...query,
    /** Debounced, trimmed query that is actually sent to the API. */
    searchQuery: validation.query,
    isSearchQueryValid: validation.isValid,
    /** True while the typed value has not settled into `searchQuery` yet. */
    isDebouncing: normalizeMessageSearchQuery(q) !== debouncedQuery,
  };
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
