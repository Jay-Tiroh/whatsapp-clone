import { storage } from "@/core/lib/storage";
import { registerResettableStore } from "@/core/store/storeRegistry";
import { type UploadStage } from "@/features/media/services/uploadMedia";
import { clearLocalOutboxFiles } from "@/features/media/utils/localMedia";
import { create } from "zustand";
import {
  createJSONStorage,
  persist,
  type StateStorage,
} from "zustand/middleware";

const mmkvStorage: StateStorage = {
  getItem: (name) => storage.getString(name) ?? null,
  setItem: (name, value) => storage.set(name, value),
  removeItem: (name) => {
    storage.remove(name); // react-native-mmkv v4; use storage.delete(name) on v3
  },
};

export type OutboxAttachment = {
  clientUploadId: string; // never regenerated: upload retry identity
  localFile: string; // file name only; resolved at use time
  contentType: string;
  sizeBytes: number;
  width?: number;
  height?: number;
  mediaId?: string;
  stage: UploadStage;
};

export type OutboxStatus = "pending" | "failed" | "conflict";
export type OutboxEntry = {
  clientMessageId: string;
  conversationId: string;
  ownerId: string;
  text: string; // may be "" for an image-only message
  attachments: OutboxAttachment[];
  createdAt: string;
  status: OutboxStatus;
  attempts: number;
  lastError?: string;
};

type State = { entries: Record<string, OutboxEntry> };

type Actions = {
  enqueue: (entry: Omit<OutboxEntry, "status" | "attempts">) => void;
  markPending: (id: string) => void;
  markFailed: (id: string, error?: string) => void;
  markConflict: (id: string, error: string) => void;
  remove: (id: string) => void;
  reset: () => void;
  patchAttachment: (
    id: string,
    clientUploadId: string,
    patch: Partial<OutboxAttachment>,
  ) => void;
  /** Replace an expired upload identity; the old clientUploadId is never reused. */
  restartAttachment: (
    id: string,
    oldClientUploadId: string,
    newClientUploadId: string,
  ) => void;
};

export const useOutboxStore = create<State & Actions>()(
  persist(
    (set) => ({
      entries: {},

      enqueue: (entry) =>
        set((s) => ({
          entries: {
            ...s.entries,
            [entry.clientMessageId]: {
              ...entry,
              status: "pending",
              attempts: 0,
            },
          },
        })),

      markPending: (id) =>
        set((s) => {
          const e = s.entries[id];
          if (!e) return s;
          return {
            entries: {
              ...s.entries,
              [id]: { ...e, status: "pending", attempts: e.attempts + 1 },
            },
          };
        }),

      markFailed: (id, error) =>
        set((s) => {
          const e = s.entries[id];
          if (!e) return s;
          return {
            entries: {
              ...s.entries,
              [id]: { ...e, status: "failed", lastError: error },
            },
          };
        }),

      markConflict: (id, error) =>
        set((s) => {
          const e = s.entries[id];
          if (!e) return s;
          return {
            entries: {
              ...s.entries,
              [id]: { ...e, status: "conflict", lastError: error },
            },
          };
        }),

      remove: (id) =>
        set((s) => {
          if (!s.entries[id]) return s;
          const { [id]: _removed, ...rest } = s.entries;
          return { entries: rest };
        }),
      patchAttachment: (id, clientUploadId, patch) =>
        set((s) => {
          const e = s.entries[id];
          if (!e) return s;
          return {
            entries: {
              ...s.entries,
              [id]: {
                ...e,
                attachments: e.attachments.map((a) =>
                  a.clientUploadId === clientUploadId ? { ...a, ...patch } : a,
                ),
              },
            },
          };
        }),
      restartAttachment: (id, oldClientUploadId, newClientUploadId) =>
        set((s) => {
          const e = s.entries[id];
          if (!e) return s;
          return {
            entries: {
              ...s.entries,
              [id]: {
                ...e,
                attachments: e.attachments.map((a) =>
                  a.clientUploadId === oldClientUploadId
                    ? {
                        ...a,
                        clientUploadId: newClientUploadId,
                        mediaId: undefined,
                        stage: "new" as const,
                      }
                    : a,
                ),
              },
            },
          };
        }),
      reset: () => set({ entries: {} }),
    }),
    {
      name: "message-outbox",
      version: 2,
      migrate: (persisted, version) => {
        if (version < 2) {
          const old =
            (persisted as { entries?: Record<string, Record<string, unknown>> })
              ?.entries ?? {};
          const entries = Object.fromEntries(
            Object.entries(old).map(([id, e]) => {
              const { mediaIds: _dropped, ...rest } = e;
              return [id, { ...rest, attachments: [] }];
            }),
          );
          return { entries } as unknown as State;
        }
        return persisted as State;
      },
      storage: createJSONStorage(() => mmkvStorage),
      partialize: (s) => ({ entries: s.entries }),
      // A request that was in flight when the app died is not "pending" any more.
      // We don't know if the server got it, so surface it as failed and let the
      // user retry. Retrying with the same clientMessageId is what makes that safe.
      merge: (persisted, current) => {
        const saved = (persisted as Partial<State> | undefined)?.entries ?? {};
        const entries = Object.fromEntries(
          Object.entries(saved).map(([id, e]) => [
            id,
            e.status === "pending" ? { ...e, status: "failed" as const } : e,
          ]),
        );
        return { ...current, entries };
      },
    },
  ),
);

registerResettableStore({
  reset: () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require("@/features/media/services/uploadMedia").cancelAllUploads();
    clearLocalOutboxFiles();
    useOutboxStore.getState().reset();
  },
});
