import { useCallback, useEffect, useMemo, useRef } from "react";

import { useAuthStore } from "@/features/auth";
import {
  OutboxAttachment,
  useOutboxStore,
} from "@/features/conversation/store/outboxStore";
import type {
  DisplayMessage,
  Message,
} from "@/features/conversation/types/message.types";
import { useQueryClient } from "@tanstack/react-query";
import * as Crypto from "expo-crypto";
import { messageApi } from "../api/message.api";

import { getSessionGeneration } from "@/core/lib/sessionGeneration";
import {
  cancelUpload,
  MediaUploadExpiredError,
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
import { isMessageIdempotencyConflict } from "@/shared/utils/errors";

const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // placeholder: set to the backend's real limit
// Module-level on purpose: a request outlives the screen that started it.
const inFlight = new Set<string>();
// Messages the user discarded while a request was in flight. A late success for
// one of these must not be written back into the chat.
const discarded = new Set<string>();

type Options = {
  conversationId: string;
  onConfirmed: (message: Message) => void;
};

export function useMessageDelivery({ conversationId, onConfirmed }: Options) {
  const ownerId = useAuthStore((s) => s.user?.id);
  const entries = useOutboxStore((s) => s.entries);
  const queryClient = useQueryClient();

  // Ref so `dispatch` stays stable and still calls the latest callback.
  const confirmedRef = useRef(onConfirmed);
  useEffect(() => {
    confirmedRef.current = onConfirmed;
  });

  const dispatch = useCallback(
    async (id: string) => {
      const store = useOutboxStore.getState();
      const entry = store.entries[id];
      if (!entry || inFlight.has(id)) return;

      // An entry only belongs to the account that created it. Never send another
      // account's queued message after an account switch.
      const signedInUser = useAuthStore.getState().user?.id;
      if (!signedInUser || signedInUser !== entry.ownerId) {
        useOutboxStore.getState().remove(id);
        return;
      }

      // Anything that completes after this session ends must be ignored.
      const generation = getSessionGeneration();

      inFlight.add(id);
      store.markPending(id);
      try {
        // Uploads first. Each stage is persisted as it lands, so a retry (even
        // after a restart) resumes instead of re-uploading.
        for (const snapshot of entry.attachments) {
          let clientUploadId = snapshot.clientUploadId;
          let restarted = false;

          // A pending authorization can expire. The contract has no renewal
          // endpoint, so recovery means a NEW clientUploadId on the same endpoint.
          while (true) {
            const current = useOutboxStore
              .getState()
              .entries[id]?.attachments.find(
                (a) => a.clientUploadId === clientUploadId,
              );
            if (!current) throw new UploadCancelledError(); // discarded mid-flight
            if (current.stage === "ready") break;

            const patch = (p: Partial<OutboxAttachment>) =>
              useOutboxStore.getState().patchAttachment(id, clientUploadId, p);

            try {
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
              if (generation !== getSessionGeneration() || discarded.has(id)) {
                throw new UploadCancelledError();
              }
              patch({ mediaId: asset.id, stage: "ready" });
              break;
            } catch (error) {
              if (error instanceof MediaUploadExpiredError && !restarted) {
                restarted = true;
                const freshId = Crypto.randomUUID();
                useOutboxStore
                  .getState()
                  .restartAttachment(id, clientUploadId, freshId);
                clientUploadId = freshId;
                continue;
              }
              throw error;
            }
          }
        }

        if (generation !== getSessionGeneration() || discarded.has(id)) return;

        const latest = useOutboxStore.getState().entries[id];
        if (!latest) return; // discarded while uploading

        const mediaIds = latest.attachments.map((a) => a.mediaId);
        if (mediaIds.some((m) => !m)) {
          throw new Error("Attachment upload incomplete");
        }

        // Send to the entry's own conversation, not the screen that happens to be
        // open now: a resumed outbox entry can outlive navigation.
        const response = await messageApi.send(latest.conversationId, {
          clientMessageId: latest.clientMessageId,
          text: latest.text || undefined,
          attachmentMediaIds: mediaIds.length
            ? (mediaIds as string[])
            : undefined,
        });

        // The user may have discarded this message, or the session may have
        // changed, while the request was in flight. A late success must not
        // resurrect it.
        if (generation !== getSessionGeneration() || discarded.has(id)) return;

        useOutboxStore.getState().remove(id);
        latest.attachments.forEach((a) => deleteLocalCopy(a.localFile));
        confirmedRef.current(response);
        queryClient.invalidateQueries({
          queryKey: ["messages", latest.conversationId],
        });
        queryClient.invalidateQueries({ queryKey: ["conversations", "list"] });
      } catch (error) {
        if (error instanceof UploadCancelledError) return;
        if (generation !== getSessionGeneration() || discarded.has(id)) return;

        // Idempotency conflict: same clientMessageId, different content. Retrying
        // the same payload can never succeed, so make it a terminal state.
        if (isMessageIdempotencyConflict(error)) {
          useOutboxStore
            .getState()
            .markConflict(
              id,
              "This message conflicts with an earlier send. Discard it and send again.",
            );
          return;
        }

        useOutboxStore
          .getState()
          .markFailed(
            id,
            error instanceof Error ? error.message : "Send failed",
          );
      } finally {
        discarded.delete(id);
        inFlight.delete(id);
      }
    },
    [queryClient],
  );

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
    discarded.add(clientMessageId);
    if (!entry) return;
    entry.attachments.forEach((a) => {
      cancelUpload(a.clientUploadId);
      deleteLocalCopy(a.localFile);
    });
    useOutboxStore.getState().remove(clientMessageId);
    // If nothing is in flight there is no late success to guard against.
    if (!inFlight.has(clientMessageId)) discarded.delete(clientMessageId);
  }, []);

  const retry = useCallback(
    (clientMessageId: string) => {
      const entry = useOutboxStore.getState().entries[clientMessageId];
      // "conflict" is terminal: retrying the identical payload can never succeed.
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
