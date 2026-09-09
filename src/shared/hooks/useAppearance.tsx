// stores/useAppearance.ts
import { Uniwind } from "uniwind";
import { create } from "zustand";

export type AccentColor = "green" | "blue" | "red" | "orange";

type PaletteScale = Record<
  "50" | "100" | "200" | "300" | "400" | "500" | "600" | "700" | "800" | "900",
  string
>;

type AccentPalette = {
  scale: PaletteScale;
  tintLight: string; // light-mode --color-primary-tint (pale wash of the hue)
};

const PALETTES: Record<AccentColor, AccentPalette> = {
  green: {
    scale: {
      "50": "#ddf1e5",
      "100": "#e8f5ed",
      "200": "#abdbbe",
      "300": "#73c393",
      "400": "#57b77d",
      "500": "#499968",
      "600": "#3a7a53",
      "700": "#2b5c3f",
      "800": "#1f2633",
      "900": "#112519",
    },
    tintLight: "#f5fbf7",
  },
  blue: {
    scale: {
      "50": "#dde6f5",
      "100": "#e8eef8",
      "200": "#abc4e6",
      "300": "#73a0d1",
      "400": "#5788c4",
      "500": "#4972a8",
      "600": "#3a5c8a",
      "700": "#2b4468",
      "800": "#1f2633",
      "900": "#111925",
    },
    tintLight: "#f5f8fd",
  },
  red: {
    scale: {
      "50": "#f5dddd",
      "100": "#f8e8e8",
      "200": "#e6abab",
      "300": "#d17373",
      "400": "#c45757",
      "500": "#a84949",
      "600": "#8a3a3a",
      "700": "#682b2b",
      "800": "#2f1f1f",
      "900": "#251111",
    },
    tintLight: "#fdf5f5",
  },
  orange: {
    scale: {
      "50": "#f5ebdd",
      "100": "#f8f0e8",
      "200": "#e6cbab",
      "300": "#d1a973",
      "400": "#c49157",
      "500": "#a87849",
      "600": "#8a613a",
      "700": "#684a2b",
      "800": "#332920",
      "900": "#251c11",
    },
    tintLight: "#fdf9f5",
  },
};

const DEFAULT_ACCENT: AccentColor = "green";

function applyAccentColor(accent: AccentColor) {
  const { scale, tintLight } = PALETTES[accent];

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

  // 400 -> primary, 200 -> primary-light — matches your current green mapping
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

type AppearanceState = {
  accentColor: AccentColor;
  setAccentColor: (accent: AccentColor) => void;
};

export const useAppearance = create<AppearanceState>((set) => ({
  accentColor: DEFAULT_ACCENT,
  setAccentColor: (accent) => {
    applyAccentColor(accent);
    set({ accentColor: accent });
  },
}));
