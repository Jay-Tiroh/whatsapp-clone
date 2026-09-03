import { getSocket } from "@/core/lib/socket";
import { useCallback, useEffect, useRef } from "react";

import type { MessageDto } from "../types/message.types";

type ReceiptPayload = {
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

type AckResponse<T = unknown> =
  | {
      ok: true;
      data: T;
    }
  | {
      ok: false;
      error: {
        code: string;
        message: string;
      };
    };

type Options = {
  conversationId: string;

  onMessageCreated?: (message: MessageDto) => void;

  onReceiptDelivered?: (receipt: ReceiptPayload) => void;

  onReceiptRead?: (receipt: ReceiptPayload) => void;

  onPresenceChanged?: (presence: PresencePayload) => void;

  onTypingStarted?: (typing: TypingPayload) => void;

  onTypingStopped?: (typing: TypingPayload) => void;
};

export function useRealtimeMessaging({
  conversationId,
  onMessageCreated,
  onReceiptDelivered,
  onReceiptRead,
  onPresenceChanged,
  onTypingStarted,
  onTypingStopped,
}: Options) {
  /**
   * Keep the latest callbacks without forcing
   * the socket listeners to be recreated every render.
   */
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

    console.log("[realtime] subscribing to conversation:", conversationId);

    console.log("[realtime] socket id:", socket.id);

    console.log("[realtime] socket connected:", socket.connected);

    /**
     * Debug every Socket.IO event.
     *
     * Keep this while debugging realtime.
     * Remove it once everything works.
     */
    const debugListener = (event: string, ...args: unknown[]) => {
      console.log("[socket:event]", event, args);
    };

    socket.onAny(debugListener);

    /**
     * message.created
     */
    const onMessageCreatedEvent = (message: MessageDto) => {
      console.log("[realtime] message.created received:", message);

      if (message.conversationId !== conversationId) {
        console.log("[realtime] message ignored - wrong conversation", {
          receivedConversationId: message.conversationId,

          currentConversationId: conversationId,
        });

        return;
      }

      handlers.current.onMessageCreated?.(message);
    };

    /**
     * receipt.delivered
     */
    const onReceiptDeliveredEvent = (receipt: ReceiptPayload) => {
      if (receipt.conversationId !== conversationId) {
        return;
      }

      handlers.current.onReceiptDelivered?.(receipt);
    };

    /**
     * receipt.read
     */
    const onReceiptReadEvent = (receipt: ReceiptPayload) => {
      if (receipt.conversationId !== conversationId) {
        return;
      }

      handlers.current.onReceiptRead?.(receipt);
    };

    /**
     * presence.changed
     */
    const onPresenceChangedEvent = (presence: PresencePayload) => {
      if (presence.conversationId !== conversationId) {
        return;
      }

      handlers.current.onPresenceChanged?.(presence);
    };

    /**
     * typing.started
     */
    const onTypingStartedEvent = (typing: TypingPayload) => {
      if (typing.conversationId !== conversationId) {
        return;
      }

      handlers.current.onTypingStarted?.(typing);
    };

    /**
     * typing.stopped
     */
    const onTypingStoppedEvent = (typing: TypingPayload) => {
      if (typing.conversationId !== conversationId) {
        return;
      }

      handlers.current.onTypingStopped?.(typing);
    };

    socket.on("message.created", onMessageCreatedEvent);

    socket.on("receipt.delivered", onReceiptDeliveredEvent);

    socket.on("receipt.read", onReceiptReadEvent);

    socket.on("presence.changed", onPresenceChangedEvent);

    socket.on("typing.started", onTypingStartedEvent);

    socket.on("typing.stopped", onTypingStoppedEvent);

    /**
     * Subscribe to the conversation.
     *
     * Your backend currently exposes presence.subscribe,
     * so this is retained exactly as your existing contract.
     */
    socket.emit(
      "presence.subscribe",
      {
        conversationId,
      },
      (ack: AckResponse) => {
        if (!ack.ok) {
          console.warn("[realtime] presence.subscribe failed:", ack.error);

          return;
        }

        console.log("[realtime] presence.subscribe succeeded", ack.data);
      },
    );

    return () => {
      console.log("[realtime] cleaning up conversation:", conversationId);

      socket.off("message.created", onMessageCreatedEvent);

      socket.off("receipt.delivered", onReceiptDeliveredEvent);

      socket.off("receipt.read", onReceiptReadEvent);

      socket.off("presence.changed", onPresenceChangedEvent);

      socket.off("typing.started", onTypingStartedEvent);

      socket.off("typing.stopped", onTypingStoppedEvent);

      socket.offAny(debugListener);

      socket.emit(
        "presence.unsubscribe",
        {
          conversationId,
        },
        (ack: AckResponse) => {
          if (!ack.ok) {
            console.warn("[realtime] presence.unsubscribe failed:", ack.error);
          }
        },
      );
    };
  }, [conversationId]);

  const startTyping = useCallback(() => {
    if (!conversationId) {
      return;
    }

    const socket = getSocket();

    if (!socket.connected) {
      console.warn("[realtime] cannot start typing - socket disconnected");

      return;
    }

    socket.emit(
      "typing.start",
      {
        conversationId,
      },
      (ack: AckResponse) => {
        if (!ack.ok) {
          console.warn("[realtime] typing.start failed:", ack.error);
        }
      },
    );
  }, [conversationId]);

  const stopTyping = useCallback(() => {
    if (!conversationId) {
      return;
    }

    const socket = getSocket();

    if (!socket.connected) {
      return;
    }

    socket.emit(
      "typing.stop",
      {
        conversationId,
      },
      (ack: AckResponse) => {
        if (!ack.ok) {
          console.warn("[realtime] typing.stop failed:", ack.error);
        }
      },
    );
  }, [conversationId]);

  return {
    startTyping,
    stopTyping,
  };
}
