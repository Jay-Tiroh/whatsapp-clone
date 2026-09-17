import { storage } from "@/core/lib/storage";
import { registerResettableStore } from "@/core/store/storeRegistry";
import {
  ACCENT_PALETTES,
  AccentColor,
  DEFAULT_ACCENT,
} from "@/shared/constants/accentThemes";
import { Uniwind } from "uniwind";
import { create } from "zustand";
import { createJSONStorage, persist, StateStorage } from "zustand/middleware";

const mmkvStorage: StateStorage = {
  setItem: (name, value) => storage.set(name, value),
  getItem: (name) => storage.getString(name) ?? null,
  removeItem: (name) => storage.remove(name),
};

function applyAccentColor(accent: AccentColor) {
  const { scale, tintLight } = ACCENT_PALETTES[accent];

  const scaleVars = {
    "--color-primary-50": scale["50"],
    "--color-primary-100": scale["100"],
    "--color-primary-200": scale["200"],
    "--color-primary-300": scale["300"],
    "--color-primary-400": scale["400"],
    "--color-primary-500": scale["500"],
    "--color-primary-600": scale["600"],
    "--color-primary-700": scale["700"],
    "--color-primary-800": scale["800"],
    "--color-primary-900": scale["900"],
  };

  Uniwind.updateCSSVariables("light", {
    ...scaleVars,
    "--color-primary": scale["400"],
    "--color-primary-light": scale["200"],
    "--color-primary-tint": tintLight,
  });

  Uniwind.updateCSSVariables("dark", {
    ...scaleVars,
    "--color-primary": scale["400"],
    "--color-primary-light": scale["200"],
  });
}

interface AppearanceState {
  accentColor: AccentColor;
  hasHydrated: boolean;
  setAccentColor: (accent: AccentColor) => void;
  setHasHydrated: (v: boolean) => void;
  reset: () => void;
}

const initialState = {
  accentColor: DEFAULT_ACCENT,
};

export const useAppearance = create<AppearanceState>()(
  persist(
    (set) => ({
      ...initialState,
      hasHydrated: false,
      setAccentColor: (accent) => {
        applyAccentColor(accent);
        set({ accentColor: accent });
      },
      setHasHydrated: (v) => set({ hasHydrated: v }),
      reset: () => {
        applyAccentColor(DEFAULT_ACCENT);
        set(initialState);
      },
    }),
    {
      name: "appearance.accent",
      storage: createJSONStorage(() => mmkvStorage),
      partialize: (state) => ({ accentColor: state.accentColor }),
      // persist only restores `accentColor` into state — it never re-runs
      // setAccentColor, so the CSS vars are still stale until we push them
      // here ourselves.
      onRehydrateStorage: () => (state) => {
        if (state) {
          applyAccentColor(state.accentColor);
          state.setHasHydrated(true);
        }
      },
    },
  ),
);

registerResettableStore({ reset: () => useAppearance.getState().reset() });
