import { useCallback, useEffect, useMemo, useState } from "react";

import { useSocket } from "@/core/hooks/useSocket";
import { useAuthStore } from "@/features/auth";
import { useGetConversationById } from "@/features/chats/hooks/useConversations";
import { mapMessage } from "@/features/conversation/api/message.api";
import {
  useGetMessages,
  useMarkConversationRead,
  useSendMessage,
} from "@/features/conversation/hooks/useMessage";
import { useRealtimeMessaging } from "@/features/conversation/hooks/useRealtimeMessaging";
import type {
  Message,
  MessageDto,
  PresencePayload,
  ReceiptPayload,
  TypingPayload,
} from "@/features/conversation/types/message.types";
import { logger } from "@/shared/utils/logger";
import * as Crypto from "expo-crypto";

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
  const sendMessage = useSendMessage(conversationId);
  const markConversationRead = useMarkConversationRead();

  const [liveMessages, setLiveMessages] = useState<Message[]>([]);
  const [isOtherUserOnline, setIsOtherUserOnline] = useState(false);
  const [isOtherUserTyping, setIsOtherUserTyping] = useState(false);
  const [otherUserReceipt, setOtherUserReceipt] =
    useState<ReceiptPayload | null>(null);

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

  const handleNewMessage = useCallback((dto: MessageDto) => {
    const message = mapMessage(dto);

    setLiveMessages((previous) => {
      const duplicate = previous.some(
        (m) =>
          m.id === message.id || m.clientMessageId === message.clientMessageId,
      );
      if (duplicate) return previous;
      return [...previous, message];
    });
  }, []);

  const handlePresenceChanged = useCallback(
    (presence: PresencePayload) => {
      if (presence.userId === currentUserId) return;
      setIsOtherUserOnline(presence.status === "online");
    },
    [currentUserId],
  );

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
    onPresenceChanged: handlePresenceChanged,
    onTypingStarted: handleTypingStarted,
    onTypingStopped: handleTypingStopped,
  });

  useSocket();

  const messages = useMemo<Message[]>(() => {
    const fetchedMessages = data?.pages.flatMap((page) => page.items) ?? [];

    const uniqueFetchedMessages = Array.from(
      new Map(
        fetchedMessages.map((message) => [
          message.clientMessageId || message.id,
          message,
        ]),
      ).values(),
    );

    const fetchedIds = new Set(uniqueFetchedMessages.map((m) => m.id));
    const fetchedClientIds = new Set(
      uniqueFetchedMessages.map((m) => m.clientMessageId),
    );

    const extraLiveMessages = liveMessages.filter(
      (message) =>
        !fetchedIds.has(message.id) &&
        !fetchedClientIds.has(message.clientMessageId),
    );

    return [...uniqueFetchedMessages, ...extraLiveMessages].sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );
  }, [data, liveMessages]);

  const handleSend = useCallback(
    (text: string) => {
      if (!currentUserId) {
        logger.warn("Cannot send message: current user unavailable");
        return;
      }

      const trimmedText = text.trim();
      if (!trimmedText) return;

      const clientMessageId = Crypto.randomUUID();

      const optimisticMessage: Message = {
        id: clientMessageId,
        conversationId,
        clientMessageId,
        senderId: currentUserId,
        kind: "text",
        text: trimmedText || null, // Updated: Reflects the nullable text type
        createdAt: new Date().toISOString(),
        attachments: [],
        replyToMessageId: null,
        editedAt: null,
        deletedAt: null,
        version: 1,
        reactions: [],
      };

      setLiveMessages((previous) => [...previous, optimisticMessage]);

      sendMessage.mutate({ clientMessageId, text: trimmedText });
    },
    [conversationId, currentUserId, sendMessage],
  );

  useEffect(() => {
    if (!conversationId) return;
    markConversationRead.mutate(conversationId);
  }, [conversationId, markConversationRead]);

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
  };
}
