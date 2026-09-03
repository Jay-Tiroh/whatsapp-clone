// features/chats/hooks/useConversationListRealtime.ts
import { getSocket } from "@/core/lib/socket";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import type { PaginatedConversations } from "../types/conversation.types";

type MessageCreatedPayload = {
  id: string;
  conversationId: string;
  senderId: string;
  kind: "text";
  text: string;
  createdAt: string;
};

const MAX_SUBSCRIBED = 20;

export function useConversationListRealtime(
  conversationIds: string[],
  currentUserId: string | undefined,
  activeConversationId?: string,
) {
  const queryClient = useQueryClient();
  const idsRef = useRef<string[]>([]);

  // Subscribe/unsubscribe as the visible conversation list changes
  useEffect(() => {
    const socket = getSocket();
    const idsToSubscribe = conversationIds.slice(0, MAX_SUBSCRIBED);

    idsToSubscribe.forEach((conversationId) => {
      if (idsRef.current.includes(conversationId)) return;

      socket.emit("presence.subscribe", { conversationId }, (ack: any) => {
        if (!ack.ok) {
          console.warn(
            "[chatlist] subscribe failed",
            conversationId,
            ack.error,
          );
        }
      });
    });

    idsRef.current
      .filter((id) => !idsToSubscribe.includes(id))
      .forEach((conversationId) => {
        socket.emit("presence.unsubscribe", { conversationId }, () => {});
      });

    idsRef.current = idsToSubscribe;

    return () => {
      idsRef.current.forEach((conversationId) => {
        socket.emit("presence.unsubscribe", { conversationId }, () => {});
      });
      idsRef.current = [];
    };
  }, [conversationIds]);

  // Listen for new messages and patch every cached conversations-list query
  useEffect(() => {
    const socket = getSocket();

    const onMessageCreated = (message: MessageCreatedPayload) => {
      queryClient.setQueriesData<PaginatedConversations>(
        { queryKey: ["conversations", "list"] },
        (old) => {
          if (!old) return old;

          const isOwnMessage = message.senderId === currentUserId;
          const isOpenRightNow =
            message.conversationId === activeConversationId;

          const updated = old.items.map((conversation) =>
            conversation.id === message.conversationId
              ? {
                  ...conversation,
                  latestMessage: {
                    id: message.id,
                    senderId: message.senderId,
                    kind: message.kind,
                    preview: message.text,
                    createdAt: message.createdAt,
                  },
                  lastActivityAt: message.createdAt,
                  unreadCount:
                    isOwnMessage || isOpenRightNow
                      ? conversation.unreadCount
                      : conversation.unreadCount + 1,
                }
              : conversation,
          );

          const index = updated.findIndex(
            (c) => c.id === message.conversationId,
          );
          if (index > 0) {
            const [moved] = updated.splice(index, 1);
            updated.unshift(moved);
          }

          return { ...old, items: updated };
        },
      );
    };

    socket.on("message.created", onMessageCreated);

    return () => {
      socket.off("message.created", onMessageCreated);
    };
  }, [queryClient, currentUserId, activeConversationId]);
}
