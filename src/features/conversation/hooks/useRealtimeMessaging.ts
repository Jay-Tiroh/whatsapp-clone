import {
  subscribeToConversation,
  unsubscribeFromConversation,
} from "@/core/lib/conversationSubscription";
import { getSocket } from "@/core/lib/socket";
import { usePresenceStore } from "@/core/store/presenceStore";
import { useCallback, useEffect, useRef } from "react";

import type {
  AckResponse,
  MessageDto,
  Options,
  PresencePayload,
  ReceiptPayload,
  TypingPayload,
} from "../types/message.types";

export function useRealtimeMessaging({
  conversationId,
  onMessageCreated,
  onReceiptDelivered,
  onReceiptRead,
  onPresenceChanged,
  onTypingStarted,
  onTypingStopped,
}: Options) {
  const setOnline = usePresenceStore((s) => s.setOnline);
  const setOffline = usePresenceStore((s) => s.setOffline);

  const handlers = useRef({
    onMessageCreated,
    onReceiptDelivered,
    onReceiptRead,
    onPresenceChanged,
    onTypingStarted,
    onTypingStopped,
  });

  useEffect(() => {
    handlers.current = {
      onMessageCreated,
      onReceiptDelivered,
      onReceiptRead,
      onPresenceChanged,
      onTypingStarted,
      onTypingStopped,
    };
  }, [
    onMessageCreated,
    onReceiptDelivered,
    onReceiptRead,
    onPresenceChanged,
    onTypingStarted,
    onTypingStopped,
  ]);

  useEffect(() => {
    if (!conversationId) {
      return;
    }

    const socket = getSocket();

    const debugListener = (event: string, ...args: unknown[]) => {
      console.log("[socket:event]", event, args);
    };
    socket.onAny(debugListener);

    const onMessageCreatedEvent = (message: MessageDto) => {
      if (message.conversationId !== conversationId) return;
      handlers.current.onMessageCreated?.(message);
    };

    const onReceiptDeliveredEvent = (receipt: ReceiptPayload) => {
      if (receipt.conversationId !== conversationId) return;
      handlers.current.onReceiptDelivered?.(receipt);
    };

    const onReceiptReadEvent = (receipt: ReceiptPayload) => {
      if (receipt.conversationId !== conversationId) return;
      handlers.current.onReceiptRead?.(receipt);
    };

    const onPresenceChangedEvent = (presence: PresencePayload) => {
      if (presence.conversationId !== conversationId) return;

      if (presence.status === "online") {
        setOnline(presence.userId);
      } else {
        setOffline(presence.userId);
      }

      handlers.current.onPresenceChanged?.(presence);
    };

    const onTypingStartedEvent = (typing: TypingPayload) => {
      if (typing.conversationId !== conversationId) return;
      handlers.current.onTypingStarted?.(typing);
    };

    const onTypingStoppedEvent = (typing: TypingPayload) => {
      if (typing.conversationId !== conversationId) return;
      handlers.current.onTypingStopped?.(typing);
    };

    socket.on("message.created", onMessageCreatedEvent);
    socket.on("receipt.delivered", onReceiptDeliveredEvent);
    socket.on("receipt.read", onReceiptReadEvent);
    socket.on("presence.changed", onPresenceChangedEvent);
    socket.on("typing.started", onTypingStartedEvent);
    socket.on("typing.stopped", onTypingStoppedEvent);

    subscribeToConversation(conversationId);

    return () => {
      socket.off("message.created", onMessageCreatedEvent);
      socket.off("receipt.delivered", onReceiptDeliveredEvent);
      socket.off("receipt.read", onReceiptReadEvent);
      socket.off("presence.changed", onPresenceChangedEvent);
      socket.off("typing.started", onTypingStartedEvent);
      socket.off("typing.stopped", onTypingStoppedEvent);
      socket.offAny(debugListener);

      unsubscribeFromConversation(conversationId);
    };
  }, [conversationId, setOnline, setOffline]);

  const startTyping = useCallback(() => {
    if (!conversationId) return;
    const socket = getSocket();
    if (!socket.connected) {
      console.warn("[realtime] cannot start typing - socket disconnected");
      return;
    }
    socket.emit("typing.start", { conversationId }, (ack: AckResponse) => {
      if (!ack.ok) console.warn("[realtime] typing.start failed:", ack.error);
    });
  }, [conversationId]);

  const stopTyping = useCallback(() => {
    if (!conversationId) return;
    const socket = getSocket();
    if (!socket.connected) return;
    socket.emit("typing.stop", { conversationId }, (ack: AckResponse) => {
      if (!ack.ok) console.warn("[realtime] typing.stop failed:", ack.error);
    });
  }, [conversationId]);

  return { startTyping, stopTyping };
}
