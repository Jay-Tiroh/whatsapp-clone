// features/chats/store/chatsStore.ts
import { storage } from "@/core/lib/storage";
import { registerResettableStore } from "@/core/store/storeRegistry";
import { create } from "zustand";
import { createJSONStorage, persist, StateStorage } from "zustand/middleware";

const mmkvStorage: StateStorage = {
  setItem: (name, value) => storage.set(name, value),
  getItem: (name) => storage.getString(name) ?? null,
  removeItem: (name) => storage.remove(name),
};

interface ChatsState {
  pinnedChatIds: string[];
  mutedChatIds: string[];
  archivedChatIds: string[];

  pin: (chatId: string) => void;
  unpin: (chatId: string) => void;
  mute: (chatId: string) => void;
  unmute: (chatId: string) => void;
  archive: (chatId: string) => void;
  unarchive: (chatId: string) => void;
  reset: () => void;
}

const initialState = {
  pinnedChatIds: [] as string[],
  mutedChatIds: [] as string[],
  archivedChatIds: [] as string[],
};

export const useChatsStore = create<ChatsState>()(
  persist(
    (set, get) => ({
      ...initialState,

      pin: (chatId) => {
        const { pinnedChatIds } = get();
        if (!pinnedChatIds.includes(chatId) && pinnedChatIds.length < 3) {
          set({ pinnedChatIds: [...pinnedChatIds, chatId] });
        }
      },

      unpin: (chatId) =>
        set((state) => ({
          pinnedChatIds: state.pinnedChatIds.filter((id) => id !== chatId),
        })),

      mute: (chatId) =>
        set((state) => ({
          mutedChatIds: state.mutedChatIds.includes(chatId)
            ? state.mutedChatIds
            : [...state.mutedChatIds, chatId],
        })),

      unmute: (chatId) =>
        set((state) => ({
          mutedChatIds: state.mutedChatIds.filter((id) => id !== chatId),
        })),

      archive: (chatId) =>
        set((state) => ({
          archivedChatIds: state.archivedChatIds.includes(chatId)
            ? state.archivedChatIds
            : [...state.archivedChatIds, chatId],
        })),

      unarchive: (chatId) =>
        set((state) => ({
          archivedChatIds: state.archivedChatIds.filter((id) => id !== chatId),
        })),

      reset: () => set(initialState),
    }),
    {
      name: "chats.preferences",
      storage: createJSONStorage(() => mmkvStorage),
    },
  ),
);

// Opt in to central reset
registerResettableStore({ reset: () => useChatsStore.getState().reset() });
