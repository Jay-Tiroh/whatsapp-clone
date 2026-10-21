// features/chats/hooks/useConversationListRealtime.ts
import { getSocket } from "@/core/lib/socket";
import { usePresenceStore } from "@/core/store/presenceStore";
import type {
  AckResponse,
  MessageDto,
  PresencePayload,
} from "@/features/conversation/types/message.types";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import type { PaginatedConversations } from "../types/conversation.types";

const MAX_SUBSCRIBED = 20;

const toPreview = (message: MessageDto): string => {
  if (message.text) return message.text;
  switch (message.kind) {
    case "image":
      return "📷 Photo";
    case "audio":
      return "🎤 Voice message";
    case "video":
      return "🎥 Video";
    case "document":
      return "📄 Document";
    default:
      return "";
  }
};

export function useConversationListRealtime(
  conversationIds: string[],
  currentUserId: string | undefined,
  activeConversationId?: string,
) {
  const queryClient = useQueryClient();
  const idsRef = useRef<string[]>([]);
  const setOnline = usePresenceStore((s) => s.setOnline);
  const setOffline = usePresenceStore((s) => s.setOffline);

  useEffect(() => {
    const socket = getSocket();
    const idsToSubscribe = conversationIds.slice(0, MAX_SUBSCRIBED);

    idsToSubscribe.forEach((conversationId) => {
      if (idsRef.current.includes(conversationId)) return;

      socket.emit(
        "presence.subscribe",
        { conversationId },
        (ack: AckResponse) => {
          if (!ack.ok) {
            console.warn(
              "[chatlist] subscribe failed",
              conversationId,
              ack.error,
            );
          }
        },
      );
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

  useEffect(() => {
    const socket = getSocket();

    const onMessageCreated = (message: MessageDto) => {
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
                    preview: toPreview(message),
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

    const onPresenceChanged = (presence: PresencePayload) => {
      if (presence.userId === currentUserId) return;
      if (presence.status === "online") {
        setOnline(presence.userId);
      } else {
        setOffline(presence.userId);
      }
    };

    socket.on("message.created", onMessageCreated);
    socket.on("presence.changed", onPresenceChanged);

    return () => {
      socket.off("message.created", onMessageCreated);
      socket.off("presence.changed", onPresenceChanged);
    };
  }, [queryClient, currentUserId, activeConversationId, setOnline, setOffline]);
}
