import { storage } from "@/core/lib/storage";
import { tokenStorage } from "@/core/lib/tokenStorage";
import { usePinStore } from "@/core/store/pinStore";
import type { AuthSession, User } from "@/features/auth/types/auth.types";
import { create } from "zustand";
import { createJSONStorage, persist, StateStorage } from "zustand/middleware";

const mmkvStorage: StateStorage = {
  setItem: (name, value) => storage.set(name, value),
  getItem: (name) => storage.getString(name) ?? null,
  removeItem: (name) => storage.remove(name),
};

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  hasHydrated: boolean;
  setSession: (auth: AuthSession) => void;
  hydrateUser: (user: User) => void;
  updateUser: (partial: Partial<User>) => void;
  clearSession: () => void;
  setHasHydrated: (v: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      hasHydrated: false,
      hydrateUser: (user: User) => set({ isAuthenticated: true, user }),
      setSession: (auth) => {
        tokenStorage.setTokens(auth.accessToken, auth.refreshToken);
        set({ isAuthenticated: true, user: auth.user });
      },

      updateUser: (partial) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...partial } : state.user,
        })),

      clearSession: () => {
        tokenStorage.clearTokens();
        usePinStore.getState().clearPin();
        set({ isAuthenticated: false, user: null });
      },

      setHasHydrated: (v) => set({ hasHydrated: v }),
    }),
    {
      name: "auth.session",
      storage: createJSONStorage(() => mmkvStorage),
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
