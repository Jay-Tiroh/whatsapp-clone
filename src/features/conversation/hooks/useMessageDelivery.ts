import { useCallback, useEffect, useMemo, useRef } from "react";

import { useAuthStore } from "@/features/auth";
import { useSendMessage } from "@/features/conversation/hooks/useMessage";
import {
  OutboxAttachment,
  useOutboxStore,
} from "@/features/conversation/store/outboxStore";
import type {
  DisplayMessage,
  Message,
} from "@/features/conversation/types/message.types";
import * as Crypto from "expo-crypto";

import {
  cancelUpload,
  UploadCancelledError,
  uploadMedia,
} from "@/features/media/services/uploadMedia";
import {
  deleteLocalCopy,
  persistLocalCopy,
  resolveLocalUri,
  type PickedImage,
} from "@/features/media/utils/localMedia";
import { inferContentType } from "@/features/media/utils/mime";

const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // placeholder: set to the backend's real limit
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
      // Uploads first. Each stage is persisted as it lands, so a retry (even
      // after a restart) resumes instead of re-uploading.
      for (const { clientUploadId } of entry.attachments) {
        const patch = (p: Partial<OutboxAttachment>) =>
          useOutboxStore.getState().patchAttachment(id, clientUploadId, p);

        const current = useOutboxStore
          .getState()
          .entries[id]?.attachments.find(
            (a) => a.clientUploadId === clientUploadId,
          );
        if (!current) throw new UploadCancelledError(); // discarded mid-flight
        if (current.stage === "ready") continue;

        const asset = await uploadMedia({
          clientUploadId,
          fileUri: resolveLocalUri(current.localFile),
          contentType: inferContentType(current.localFile),
          sizeBytes: current.sizeBytes,
          purpose: "message_attachment",
          originalFilename: current.localFile,
          stage: current.stage,
          mediaId: current.mediaId,
          onMediaCreated: (mediaId) => patch({ mediaId }),
          onUploaded: () => patch({ stage: "uploaded" }),
        });
        patch({ mediaId: asset.id, stage: "ready" });
      }

      const latest = useOutboxStore.getState().entries[id];
      if (!latest) return; // discarded while uploading

      const mediaIds = latest.attachments.map((a) => a.mediaId);
      if (mediaIds.some((m) => !m)) {
        throw new Error("Attachment upload incomplete");
      }

      const response = await sendRef.current({
        clientMessageId: latest.clientMessageId,
        text: latest.text || undefined,
        attachmentMediaIds: mediaIds.length
          ? (mediaIds as string[])
          : undefined,
      });
      useOutboxStore.getState().remove(id);
      latest.attachments.forEach((a) => deleteLocalCopy(a.localFile));
      confirmedRef.current(response);
    } catch (error) {
      if (error instanceof UploadCancelledError) return;
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
        attachments: [],
        createdAt: new Date().toISOString(),
      });
      void dispatch(clientMessageId);
    },
    [conversationId, ownerId, dispatch],
  );

  const sendImage = useCallback(
    async (picked: PickedImage, caption = "") => {
      if (!ownerId) return;

      const clientMessageId = Crypto.randomUUID();
      const clientUploadId = Crypto.randomUUID();

      const local = await persistLocalCopy(picked.uri, clientUploadId);
      if (local.sizeBytes > MAX_IMAGE_BYTES) {
        deleteLocalCopy(local.file);
        throw new Error("That image is too large to send");
      }

      useOutboxStore.getState().enqueue({
        clientMessageId,
        conversationId,
        ownerId,
        text: caption.trim(),
        attachments: [
          {
            clientUploadId,
            localFile: local.file,
            contentType: inferContentType(local.file),
            sizeBytes: local.sizeBytes,
            width: picked.width,
            height: picked.height,
            stage: "new",
          },
        ],
        createdAt: new Date().toISOString(),
      });
      void dispatch(clientMessageId);
    },
    [conversationId, ownerId, dispatch],
  );

  const discard = useCallback((clientMessageId: string) => {
    const entry = useOutboxStore.getState().entries[clientMessageId];
    if (!entry) return;
    entry.attachments.forEach((a) => {
      cancelUpload(a.clientUploadId);
      deleteLocalCopy(a.localFile);
    });
    useOutboxStore.getState().remove(clientMessageId);
  }, []);

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
          kind: e.attachments.length ? "image" : "text",
          text: e.text || null,
          attachments: e.attachments.map((a) => ({
            mediaId: a.mediaId ?? a.clientUploadId,
            type: "image" as const,
            contentType: a.contentType,
            sizeBytes: a.sizeBytes,
            url: resolveLocalUri(a.localFile), // shows instantly, before any upload
            width: a.width,
            height: a.height,
          })),
          createdAt: e.createdAt,
          replyToMessageId: null,
          editedAt: null,
          deletedAt: null,
          version: 1,
          reactions: [],
          delivery: e.status,
        })),
    [entries, conversationId, ownerId],
  );

  return { send, sendImage, retry, discard, outboxMessages };
}
