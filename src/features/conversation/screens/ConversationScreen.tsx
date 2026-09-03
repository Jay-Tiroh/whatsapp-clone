import Bg from "@/assets/images/bg.svg";

import { useSocket } from "@/core/hooks/useSocket";

import { useAuthStore } from "@/features/auth";

import {
  useGetMessages,
  useMarkConversationRead,
  useSendMessage,
} from "@/features/conversation/hooks/useMessage";

import { useRealtimeMessaging } from "@/features/conversation/hooks/useRealtimeMessaging";

import type {
  Message,
  MessageDto,
} from "@/features/conversation/types/message.types";

import ChatLayoutWrapper from "@/shared/components/ChatLayoutWrapper";

import { logger } from "@/shared/utils/logger";

import * as Crypto from "expo-crypto";

import { useLocalSearchParams } from "expo-router";

import { useCallback, useEffect, useMemo, useState } from "react";

import { StyleSheet, View } from "react-native";

import { withUniwind } from "uniwind";

import { useGetConversationById } from "@/features/chats/hooks/useConversations";
import ChatHeader from "../components/ChatHeader";
import MessageInputBar from "../components/MessageInputBar";
import MessageList from "../components/MessageList";

export type ReceiptPayload = {
  conversationId: string;
  userId: string;
  throughMessageId: string;
  at: string;
  version: number;

  delivered: {
    messageId: string;
    at: string;
  } | null;

  read: {
    messageId: string;
    at: string;
  } | null;
};

type PresencePayload = {
  conversationId: string;
  userId: string;
  status: "online" | "offline";
  occurredAt: string;
};

type TypingPayload = {
  conversationId: string;
  userId: string;
  expiresAt?: string;
  occurredAt?: string;
};

const StyledBg = withUniwind(Bg);

export default function ConversationScreen() {
  const { conversationId } = useLocalSearchParams<{
    conversationId: string;
  }>();

  logger.log("ConversationScreen params", conversationId);

  const currentUserId = useAuthStore((state) => state.user?.id);

  const { data } = useGetMessages(conversationId);
  const { data: conversation } = useGetConversationById(conversationId);
  const sendMessage = useSendMessage(conversationId);

  const [liveMessages, setLiveMessages] = useState<Message[]>([]);

  const [isOtherUserOnline, setIsOtherUserOnline] = useState(false);

  const [isOtherUserTyping, setIsOtherUserTyping] = useState(false);
  const [otherUserReceipt, setOtherUserReceipt] =
    useState<ReceiptPayload | null>(null);

  const handleReceiptDelivered = useCallback(
    (receipt: ReceiptPayload) => {
      if (receipt.userId === currentUserId) return; // ignore receipts about myself
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
  /**
   * Receive a realtime message.
   */
  const handleNewMessage = useCallback((dto: MessageDto) => {
    console.log("[ConversationScreen] realtime message:", dto);

    setLiveMessages((previous) => {
      const duplicate = previous.some(
        (message) =>
          message.id === dto.id ||
          message.clientMessageId === dto.clientMessageId,
      );

      if (duplicate) {
        console.log("[ConversationScreen] duplicate message ignored");

        return previous;
      }

      return [...previous, dto];
    });
  }, []);

  /**
   * Presence updates.
   */
  const handlePresenceChanged = useCallback(
    (presence: PresencePayload) => {
      if (presence.userId === currentUserId) {
        return;
      }

      setIsOtherUserOnline(presence.status === "online");
    },
    [currentUserId],
  );

  /**
   * Other user started typing.
   */
  const handleTypingStarted = useCallback(
    (typing: TypingPayload) => {
      if (typing.userId === currentUserId) {
        return;
      }

      setIsOtherUserTyping(true);
    },
    [currentUserId],
  );

  /**
   * Other user stopped typing.
   */
  const handleTypingStopped = useCallback(
    (typing: TypingPayload) => {
      if (typing.userId === currentUserId) {
        return;
      }

      setIsOtherUserTyping(false);
    },
    [currentUserId],
  );

  /**
   * Socket realtime layer.
   */
  const { startTyping, stopTyping } = useRealtimeMessaging({
    conversationId,

    onMessageCreated: handleNewMessage,

    onReceiptDelivered: handleReceiptDelivered,

    onReceiptRead: handleReceiptRead,

    onPresenceChanged: handlePresenceChanged,

    onTypingStarted: handleTypingStarted,

    onTypingStopped: handleTypingStopped,
  });

  /**
   * Keep the global socket alive.
   */
  useSocket();

  /**
   * Merge API messages and realtime messages.
   *
   * API pages are flattened first because:
   *
   * data.pages = PaginatedMessages[]
   *
   * and each page contains:
   *
   * page.items = Message[]
   */
  const messages = useMemo<Message[]>(() => {
    const fetchedMessages = data?.pages.flatMap((page) => page.items) ?? [];

    /**
     * Deduplicate fetched messages.
     */
    const uniqueFetchedMessages = Array.from(
      new Map(
        fetchedMessages.map((message) => [
          message.clientMessageId || message.id,
          message,
        ]),
      ).values(),
    );

    const fetchedIds = new Set(
      uniqueFetchedMessages.map((message) => message.id),
    );

    const fetchedClientIds = new Set(
      uniqueFetchedMessages.map((message) => message.clientMessageId),
    );

    /**
     * Only keep realtime messages
     * that aren't already present
     * in the API response.
     */
    const extraLiveMessages = liveMessages.filter(
      (message) =>
        !fetchedIds.has(message.id) &&
        !fetchedClientIds.has(message.clientMessageId),
    );

    /**
     * Combine and sort chronologically.
     */
    return [...uniqueFetchedMessages, ...extraLiveMessages].sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );
  }, [data, liveMessages]);

  /**
   * Send message.
   */
  const handleSend = useCallback(
    (text: string) => {
      if (!currentUserId) {
        logger.warn("Cannot send message: current user unavailable");

        return;
      }

      const trimmedText = text.trim();

      if (!trimmedText) {
        return;
      }

      const clientMessageId = Crypto.randomUUID();

      /**
       * Optimistic message.
       */
      const optimisticMessage: Message = {
        id: clientMessageId,
        conversationId,
        clientMessageId,
        senderId: currentUserId,
        kind: "text",
        text: trimmedText,
        createdAt: new Date().toISOString(),
      };

      setLiveMessages((previous) => [...previous, optimisticMessage]);

      sendMessage.mutate({
        clientMessageId,
        text: trimmedText,
      });
    },
    [conversationId, currentUserId, sendMessage],
  );

  const markConversationRead = useMarkConversationRead();

  useEffect(() => {
    if (!conversationId) return;
    markConversationRead.mutate(conversationId);
  }, [conversationId]);

  return (
    <View
      className="flex-1 items-center bg-transparent relative w-full"
      style={StyleSheet.absoluteFill}
    >
      <StyledBg
        className="absolute top-0 left-0 right-0 bottom-0 flex-1 w-full h-full dark:text-neutral-700 text-primary-100 bg-primary-50 dark:bg-neutral-900"
        style={StyleSheet.absoluteFill}
        preserveAspectRatio="xMidYMid slice"
      />

      <ChatLayoutWrapper
        bottomInputClassName="bg-transparent"
        bottomInput={
          <MessageInputBar
            onSend={handleSend}
            onTypingStart={startTyping}
            onTypingStop={stopTyping}
          />
        }
      >
        <View
          className="flex-1 items-center relative"
          style={StyleSheet.absoluteFill}
        >
          <ChatHeader conversation={conversation} />

          <View className="flex-1 w-full bg-transparent px-safe-offset-5 pb-5">
            <MessageList
              conversationId={conversationId}
              messages={messages}
              otherUserReceipt={otherUserReceipt}
            />
          </View>
        </View>
      </ChatLayoutWrapper>
    </View>
  );
}
