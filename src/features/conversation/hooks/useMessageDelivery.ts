import { useCallback, useEffect, useMemo, useRef } from "react";

import { useAuthStore } from "@/features/auth";
import { useSendMessage } from "@/features/conversation/hooks/useMessage";
import { useOutboxStore } from "@/features/conversation/store/outboxStore";
import type {
  DisplayMessage,
  Message,
} from "@/features/conversation/types/message.types";
import * as Crypto from "expo-crypto";

// Module-level on purpose: a request outlives the screen that started it.
const inFlight = new Set<string>();

type Options = {
  conversationId: string;
  onConfirmed: (message: Message) => void;
};

export function useMessageDelivery({ conversationId, onConfirmed }: Options) {
  const ownerId = useAuthStore((s) => s.user?.id);
  const entries = useOutboxStore((s) => s.entries);
  const { mutateAsync } = useSendMessage(conversationId);

  // Refs so `dispatch` stays stable and still calls the latest functions.
  const sendRef = useRef(mutateAsync);
  const confirmedRef = useRef(onConfirmed);
  useEffect(() => {
    sendRef.current = mutateAsync;
    confirmedRef.current = onConfirmed;
  });

  const dispatch = useCallback(async (id: string) => {
    const store = useOutboxStore.getState();
    const entry = store.entries[id];
    if (!entry || inFlight.has(id)) return;

    inFlight.add(id);
    store.markPending(id);
    try {
      // Same clientMessageId on every attempt: that is what lets the server
      // treat a retry as the same message instead of a second one.
      const response = await sendRef.current({
        clientMessageId: entry.clientMessageId,
        text: entry.text,
      });
      useOutboxStore.getState().remove(id);
      confirmedRef.current(response); // drop mapMessage if the hook already returns a Message
    } catch (error) {
      useOutboxStore
        .getState()
        .markFailed(id, error instanceof Error ? error.message : "Send failed");
    } finally {
      inFlight.delete(id);
    }
  }, []);

  const send = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!ownerId || !trimmed) return;

      const clientMessageId = Crypto.randomUUID();
      useOutboxStore.getState().enqueue({
        clientMessageId,
        conversationId,
        ownerId,
        text: trimmed,
        mediaIds: [],
        createdAt: new Date().toISOString(),
      });
      void dispatch(clientMessageId);
    },
    [conversationId, ownerId, dispatch],
  );

  const retry = useCallback(
    (clientMessageId: string) => {
      const entry = useOutboxStore.getState().entries[clientMessageId];
      if (entry?.status === "failed") void dispatch(clientMessageId);
    },
    [dispatch],
  );

  const outboxMessages = useMemo<DisplayMessage[]>(
    () =>
      Object.values(entries)
        .filter(
          (e) => e.conversationId === conversationId && e.ownerId === ownerId,
        )
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
        .map((e) => ({
          id: e.clientMessageId,
          conversationId: e.conversationId,
          clientMessageId: e.clientMessageId,
          senderId: e.ownerId,
          kind: "text",
          text: e.text,
          createdAt: e.createdAt,
          attachments: [],
          replyToMessageId: null,
          editedAt: null,
          deletedAt: null,
          version: 1,
          reactions: [],
          delivery: e.status,
        })),
    [entries, conversationId, ownerId],
  );

  return { send, retry, outboxMessages };
}
