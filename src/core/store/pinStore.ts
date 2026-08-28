import { storage } from "@/core/lib/storage";
import { registerResettableStore } from "@/core/store/storeRegistry";
import { create } from "zustand";
import { createJSONStorage, persist, StateStorage } from "zustand/middleware";

const mmkvStorage: StateStorage = {
  setItem: (name, value) => storage.set(name, value),
  getItem: (name) => storage.getString(name) ?? null,
  removeItem: (name) => storage.remove(name),
};

interface PinState {
  hasPromptedPinSetup: boolean;
  hasSetupPin: boolean;
  pin: string | null;
  hasHydrated: boolean;
  setPromptedPinSetup: () => void;
  setPin: (pin: string) => void;
  verifyPin: (pin: string) => boolean;
  clearPin: () => void;
  setHasHydrated: (v: boolean) => void;
  isLocked: boolean;
  lastBackgroundedAt: number | null;
  lock: () => void;
  unlock: () => void;
  setLastBackgroundedAt: (ts: number | null) => void;
  reset: () => void;
}

const initialState = {
  hasPromptedPinSetup: false,
  hasSetupPin: false,
  pin: null as string | null,
  isLocked: false,
  lastBackgroundedAt: null as number | null,
};

export const usePinStore = create<PinState>()(
  persist(
    (set, get) => ({
      ...initialState,
      hasHydrated: false,
      setPromptedPinSetup: () => set({ hasPromptedPinSetup: true }),
      setPin: (pin) => set({ pin, hasSetupPin: true }),
      verifyPin: (pin) => get().pin === pin,
      clearPin: () => set(initialState),
      setHasHydrated: (v) => set({ hasHydrated: v }),
      lock: () => set({ isLocked: true }),
      unlock: () => set({ isLocked: false }),
      setLastBackgroundedAt: (ts) => set({ lastBackgroundedAt: ts }),
      reset: () => set(initialState),
    }),
    {
      name: "auth.pin",
      storage: createJSONStorage(() => mmkvStorage),
      partialize: (state) => ({
        hasPromptedPinSetup: state.hasPromptedPinSetup,
        hasSetupPin: state.hasSetupPin,
        pin: state.pin,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);

registerResettableStore({ reset: () => usePinStore.getState().reset() });
