import { create } from "zustand";
import {
  createJSONStorage,
  persist,
  type StateStorage,
} from "zustand/middleware";

import { storage } from "@/core/lib/storage"; // adjust to wherever your MMKV file lives
import { registerResettableStore } from "@/core/store/storeRegistry";

const mmkvStorage: StateStorage = {
  getItem: (name) => storage.getString(name) ?? null,
  setItem: (name, value) => storage.set(name, value),
  removeItem: (name) => {
    storage.remove(name); // react-native-mmkv v4; use storage.delete(name) on v3
  },
};

export type OutboxStatus = "pending" | "failed";

export type OutboxEntry = {
  clientMessageId: string; // never regenerated: this is the retry identity
  conversationId: string;
  ownerId: string; // account that wrote it, so account B never sees A's drafts
  text: string;
  mediaIds: string[]; // reserved for 6.4 so a finished upload survives a failed send
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
  remove: (id: string) => void;
  reset: () => void;
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

      remove: (id) =>
        set((s) => {
          if (!s.entries[id]) return s;
          const { [id]: _removed, ...rest } = s.entries;
          return { entries: rest };
        }),

      reset: () => set({ entries: {} }),
    }),
    {
      name: "message-outbox",
      version: 1,
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

registerResettableStore({ reset: () => useOutboxStore.getState().reset() });
