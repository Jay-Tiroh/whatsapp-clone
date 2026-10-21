// core/store/presenceStore.ts
import { create } from "zustand";

type PresenceState = {
  onlineUserIds: Set<string>;
  setOnline: (userId: string) => void;
  setOffline: (userId: string) => void;
};

export const usePresenceStore = create<PresenceState>((set) => ({
  onlineUserIds: new Set(),

  setOnline: (userId) =>
    set((state) => {
      if (state.onlineUserIds.has(userId)) return state;
      const next = new Set(state.onlineUserIds);
      next.add(userId);
      return { onlineUserIds: next };
    }),

  setOffline: (userId) =>
    set((state) => {
      if (!state.onlineUserIds.has(userId)) return state;
      const next = new Set(state.onlineUserIds);
      next.delete(userId);
      return { onlineUserIds: next };
    }),
}));

// Selector hook — components subscribe to just one user's status,
// so a presence change elsewhere doesn't re-render every ChatItem.
export const useIsUserOnline = (userId?: string) =>
  usePresenceStore((state) =>
    userId ? state.onlineUserIds.has(userId) : false,
  );
