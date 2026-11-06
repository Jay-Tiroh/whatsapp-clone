import { getSocket } from "@/core/lib/socket";
import { usePresenceStore } from "@/core/store/presenceStore";
import type {
  AckResponse,
  MessageDto,
  PresencePayload,
} from "@/features/conversation/types/message.types";
import { logger } from "@/shared/utils/logger";
import { InfiniteData, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";

import type {
  Conversation,
  PaginatedConversations,
} from "../types/conversation.types";

const isNewer = (incoming: string, current: string | undefined): boolean => {
  if (!current) return true;
  const a = Date.parse(incoming);
  const b = Date.parse(current);
  return Number.isNaN(a) || Number.isNaN(b) ? incoming > current : a > b;
};

export function applyMessageCreated(
  old: PaginatedConversations,
  message: MessageDto,
  currentUserId: string | undefined,
  activeConversationId: string | undefined,
): { data: PaginatedConversations; found: boolean } {
  const index = old.items.findIndex((c) => c.id === message.conversationId);
  if (index === -1) return { data: old, found: false };

  const conversation = old.items[index];
  const latest = conversation.latestMessage;

  // Replay or stale event: same message, or not newer than what we show.
  if (
    latest?.id === message.id ||
    !isNewer(message.createdAt, latest?.createdAt)
  ) {
    return { data: old, found: true };
  }

  const isOwnMessage = message.senderId === currentUserId;
  const isOpenRightNow = message.conversationId === activeConversationId;

  const updated: Conversation = {
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
  };

  const rest = old.items.filter((_, i) => i !== index);

  // Pinned chats stay on top. An unpinned chat goes just below the last pinned one.
  const insertAt = updated.settings.pinned
    ? 0
    : rest.map((c) => c.settings.pinned).lastIndexOf(true) + 1;

  const items = [...rest.slice(0, insertAt), updated, ...rest.slice(insertAt)];
  return { data: { ...old, items }, found: true };
}

export function applyMessageCreatedToPages(
  old: InfiniteData<PaginatedConversations>,
  message: MessageDto,
  currentUserId: string | undefined,
  activeConversationId: string | undefined,
): { data: InfiniteData<PaginatedConversations>; found: boolean } {
  if (old.pages.length === 0) return { data: old, found: false };

  const sizes = old.pages.map((p) => p.items.length);
  const flat: PaginatedConversations = {
    items: old.pages.flatMap((p) => p.items),
    pageInfo: old.pages[0].pageInfo,
  };

  const result = applyMessageCreated(
    flat,
    message,
    currentUserId,
    activeConversationId,
  );
  if (result.data === flat) return { data: old, found: result.found };

  let offset = 0;
  const pages = old.pages.map((page, i) => {
    const items = result.data.items.slice(offset, offset + sizes[i]);
    offset += sizes[i];
    return { ...page, items };
  });

  return { data: { ...old, pages }, found: true };
}
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
            logger.warn(
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
      let missing = false;

      queryClient.setQueriesData<InfiniteData<PaginatedConversations>>(
        { queryKey: ["conversations", "list"] },
        (old) => {
          if (!old) return old;
          const result = applyMessageCreatedToPages(
            old,
            message,
            currentUserId,
            activeConversationId,
          );
          if (!result.found) missing = true;
          return result.data;
        },
      );
      // A brand-new chat, or one past the cached page: let the server decide.
      if (missing) {
        queryClient.invalidateQueries({ queryKey: ["conversations", "list"] });
      }
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
