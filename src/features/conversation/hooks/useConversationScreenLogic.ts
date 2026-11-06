import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useSocket } from "@/core/hooks/useSocket";
import { useIsUserOnline } from "@/core/store/presenceStore";
import { useAuthStore } from "@/features/auth";
import { useGetConversationById } from "@/features/chats/hooks/useConversations";
import { mapMessage } from "@/features/conversation/api/message.api";
import {
  useGetMessages,
  useMarkConversationRead,
} from "@/features/conversation/hooks/useMessage";
import { useMessageDelivery } from "@/features/conversation/hooks/useMessageDelivery";
import { useRealtimeMessaging } from "@/features/conversation/hooks/useRealtimeMessaging";
import { useOutboxStore } from "@/features/conversation/store/outboxStore";
import type {
  DisplayMessage,
  Message,
  MessageDto,
  ReceiptPayload,
  TypingPayload,
} from "@/features/conversation/types/message.types";
import {
  useMarkReceiptDelivered,
  useMarkReceiptRead,
} from "@/features/receipt/hooks/useReceipt";
import { useIsFocused } from "expo-router";

export function useConversationScreenLogic(conversationId: string) {
  const currentUserId = useAuthStore((state) => state.user?.id);

  const {
    data,
    refetch,
    isRefetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useGetMessages(conversationId);

  const { data: conversation } = useGetConversationById(conversationId);
  const { mutate: markRead } = useMarkConversationRead();
  const { mutate: markDelivered } = useMarkReceiptDelivered(conversationId);
  const { mutate: markReceiptRead } = useMarkReceiptRead(conversationId);

  const lastDeliveredId = useRef<string | null>(null);
  const lastReadMessageId = useRef<string | null>(null);
  const lastReceiptReadId = useRef<string | null>(null);
  const isFocused = useIsFocused();

  const [liveMessages, setLiveMessages] = useState<Message[]>([]);
  const [isOtherUserTyping, setIsOtherUserTyping] = useState(false);
  const [otherUserReceipt, setOtherUserReceipt] =
    useState<ReceiptPayload | null>(null);

  const otherParticipantId =
    conversation?.type === "direct"
      ? conversation.otherParticipant.id
      : undefined;
  const isOtherUserOnline = useIsUserOnline(otherParticipantId);

  const handleReceiptDelivered = useCallback(
    (receipt: ReceiptPayload) => {
      if (receipt.userId === currentUserId) return;
      setOtherUserReceipt((prev) =>
        !prev || receipt.version > prev.version ? receipt : prev,
      );
    },
    [currentUserId],
  );

  const handleReceiptRead = useCallback(
    (receipt: ReceiptPayload) => {
      if (receipt.userId === currentUserId) return;
      setOtherUserReceipt((prev) =>
        !prev || receipt.version >= prev.version ? receipt : prev,
      );
    },
    [currentUserId],
  );

  const upsertLive = useCallback((message: Message) => {
    setLiveMessages((previous) => {
      const i = previous.findIndex(
        (m) =>
          m.id === message.id || m.clientMessageId === message.clientMessageId,
      );
      if (i === -1) return [...previous, message];
      if (previous[i].version > message.version) return previous; // never go backwards
      const next = [...previous];
      next[i] = message;
      return next;
    });
  }, []);

  const handleNewMessage = useCallback(
    (dto: MessageDto) => {
      const message = mapMessage(dto);
      // Socket confirmed it, possibly before the HTTP response did.
      useOutboxStore.getState().remove(message.clientMessageId);
      upsertLive(message);
    },
    [upsertLive],
  );

  const { send, retry, outboxMessages } = useMessageDelivery({
    conversationId,
    onConfirmed: upsertLive,
  });

  const handleTypingStarted = useCallback(
    (typing: TypingPayload) => {
      if (typing.userId === currentUserId) return;
      setIsOtherUserTyping(true);
    },
    [currentUserId],
  );

  const handleTypingStopped = useCallback(
    (typing: TypingPayload) => {
      if (typing.userId === currentUserId) return;
      setIsOtherUserTyping(false);
    },
    [currentUserId],
  );

  const { startTyping, stopTyping } = useRealtimeMessaging({
    conversationId,
    onMessageCreated: handleNewMessage,
    onReceiptDelivered: handleReceiptDelivered,
    onReceiptRead: handleReceiptRead,
    onTypingStarted: handleTypingStarted,
    onTypingStopped: handleTypingStopped,
  });

  useSocket();

  const messages = useMemo<DisplayMessage[]>(() => {
    const fetchedMessages = data?.pages.flatMap((page) => page.items) ?? [];

    const uniqueFetchedMessages = Array.from(
      new Map(
        fetchedMessages.map((m) => [m.clientMessageId || m.id, m]),
      ).values(),
    );

    const fetchedIds = new Set(uniqueFetchedMessages.map((m) => m.id));
    const fetchedClientIds = new Set(
      uniqueFetchedMessages.map((m) => m.clientMessageId),
    );

    const extraLiveMessages = liveMessages.filter(
      (m) => !fetchedIds.has(m.id) && !fetchedClientIds.has(m.clientMessageId),
    );

    const serverMessages = [
      ...uniqueFetchedMessages,
      ...extraLiveMessages,
    ].sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );

    // Anything the server already knows about is no longer "unconfirmed".
    const serverClientIds = new Set(
      serverMessages.map((m) => m.clientMessageId),
    );
    const unconfirmed = outboxMessages.filter(
      (m) => !serverClientIds.has(m.clientMessageId),
    );

    // Unconfirmed messages go last. Device clocks and server clocks can disagree,
    // so we don't sort local timestamps in among server ones.
    return [...serverMessages, ...unconfirmed];
  }, [data, liveMessages, outboxMessages]);

  // Latest message from the OTHER user: the only kind that needs marking read
  const latestIncomingMessageId = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].senderId !== currentUserId) return messages[i].id;
    }
    return null;
  }, [messages, currentUserId]);

  // Reset when switching conversations
  useEffect(() => {
    lastDeliveredId.current = null;
    lastReadMessageId.current = null;
    lastReceiptReadId.current = null;
  }, [conversationId]);

  // Delivered: the message reached this device
  useEffect(() => {
    if (!latestIncomingMessageId) return;
    if (lastDeliveredId.current === latestIncomingMessageId) return;

    lastDeliveredId.current = latestIncomingMessageId;
    markDelivered(
      { throughMessageId: latestIncomingMessageId },
      {
        onError: () => {
          lastDeliveredId.current = null;
        },
      },
    );
  }, [latestIncomingMessageId, markDelivered]);

  // Read: the user is looking at it
  useEffect(() => {
    if (!isFocused || !latestIncomingMessageId) return;

    if (lastReadMessageId.current !== latestIncomingMessageId) {
      lastReadMessageId.current = latestIncomingMessageId;
      markRead(conversationId, {
        onError: () => {
          lastReadMessageId.current = null;
        },
      });
    }

    if (lastReceiptReadId.current !== latestIncomingMessageId) {
      lastReceiptReadId.current = latestIncomingMessageId;
      markReceiptRead(
        { throughMessageId: latestIncomingMessageId },
        {
          onError: () => {
            lastReceiptReadId.current = null;
          },
        },
      );
    }
  }, [
    isFocused,
    latestIncomingMessageId,
    conversationId,
    markRead,
    markReceiptRead,
  ]);
  const handleSend = send;

  const isGroupConversation = useMemo(() => {
    return conversation?.type === "group";
  }, [conversation]);

  const onRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const onLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return {
    conversation,
    messages,
    isOtherUserOnline,
    isOtherUserTyping,
    otherUserReceipt,
    handleSend,
    startTyping,
    stopTyping,
    refreshing: isRefetching,
    onRefresh,
    onLoadMore,
    isFetchingNextPage,
    isGroupConversation,
    retrySend: retry,
  };
}
