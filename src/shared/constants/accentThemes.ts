export type AccentColor =
  | "green"
  | "blue"
  | "red"
  | "orange"
  | "lavender"
  | "moonlight"
  | "teal"
  | "rose"
  | "amber"
  | "indigo"
  | "mint"
  | "slate";

export type PaletteScale = Record<
  "50" | "100" | "200" | "300" | "400" | "500" | "600" | "700" | "800" | "900",
  string
>;

export type AccentPalette = {
  scale: PaletteScale;
  tintLight: string; // light-mode --color-primary-tint (pale wash of the hue)
};

export const DEFAULT_ACCENT: AccentColor = "green";

// Single source of truth for accent hues.
// scale.400 / scale.200 are what actually get applied as
// --color-primary / --color-primary-light at runtime — keep these
// in sync with the matching bg-<id>-400 / text-<id>-400 entries you
// add to global.css, or the swatch preview will lie (see note above).
export const ACCENT_PALETTES: Record<AccentColor, AccentPalette> = {
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
  lavender: {
    scale: {
      "50": "#ece0f5",
      "100": "#f1e8f8",
      "200": "#c9abe6",
      "300": "#a573d1",
      "400": "#8f57c4",
      "500": "#7849a8",
      "600": "#613a8a",
      "700": "#492b68",
      "800": "#282033",
      "900": "#1c1425",
    },
    tintLight: "#f9f5fd",
  },
  moonlight: {
    scale: {
      "50": "#dde2f0",
      "100": "#e8ebf5",
      "200": "#abb8e0",
      "300": "#7386c7",
      "400": "#576bb3",
      "500": "#495797",
      "600": "#3a457a",
      "700": "#2b345c",
      "800": "#1f2633",
      "900": "#111420",
    },
    tintLight: "#f5f6fb",
  },
  teal: {
    scale: {
      "50": "#ddf0ee",
      "100": "#e8f5f3",
      "200": "#abdcd4",
      "300": "#73c4b6",
      "400": "#57b8a5",
      "500": "#499a89",
      "600": "#3a7b6e",
      "700": "#2b5d53",
      "800": "#1f3330",
      "900": "#112520",
    },
    tintLight: "#f5fbfa",
  },
  rose: {
    scale: {
      "50": "#f5dde6",
      "100": "#f8e8ee",
      "200": "#e6abc4",
      "300": "#d173a0",
      "400": "#c4578c",
      "500": "#a84974",
      "600": "#8a3a5f",
      "700": "#682b47",
      "800": "#2f1f28",
      "900": "#25111a",
    },
    tintLight: "#fdf5f8",
  },
  amber: {
    scale: {
      "50": "#f5ecdd",
      "100": "#f8f1e8",
      "200": "#e6d0ab",
      "300": "#d1b273",
      "400": "#c49f57",
      "500": "#a88449",
      "600": "#8a6c3a",
      "700": "#68502b",
      "800": "#332c1f",
      "900": "#251e11",
    },
    tintLight: "#fdfaf5",
  },
  indigo: {
    scale: {
      "50": "#dde2f5",
      "100": "#e8ebf8",
      "200": "#abbce6",
      "300": "#7391d1",
      "400": "#5775c4",
      "500": "#4961a8",
      "600": "#3a4e8a",
      "700": "#2b3a68",
      "800": "#1f2333",
      "900": "#111625",
    },
    tintLight: "#f5f7fd",
  },
  mint: {
    scale: {
      "50": "#ddf5ea",
      "100": "#e8f8f0",
      "200": "#abe6cb",
      "300": "#73d1a9",
      "400": "#57c493",
      "500": "#49a87c",
      "600": "#3a8a65",
      "700": "#2b684c",
      "800": "#1f332a",
      "900": "#11251a",
    },
    tintLight: "#f5fdf9",
  },
  slate: {
    scale: {
      "50": "#dde2e6",
      "100": "#e8ecef",
      "200": "#abbcc6",
      "300": "#7391a3",
      "400": "#577c91",
      "500": "#496578",
      "600": "#3a5262",
      "700": "#2b3d4a",
      "800": "#1f272e",
      "900": "#11171c",
    },
    tintLight: "#f5f8fa",
  },
};

// UI metadata — literal, static classnames (see note above on why
// these can't be templated from ACCENT_PALETTES' keys).
export const THEMES: {
  id: AccentColor;
  name: string;
  colorClass: string;
  textClass: string;
}[] = [
  {
    id: "green",
    name: "Green",
    colorClass: "bg-green-400",
    textClass: "text-green-400",
  },
  {
    id: "blue",
    name: "Blue",
    colorClass: "bg-blue-400",
    textClass: "text-blue-400",
  },
  {
    id: "red",
    name: "Red",
    colorClass: "bg-red-400",
    textClass: "text-red-400",
  },
  {
    id: "orange",
    name: "Orange",
    colorClass: "bg-orange-400",
    textClass: "text-orange-400",
  },
  {
    id: "lavender",
    name: "Lavender",
    colorClass: "bg-lavender-400",
    textClass: "text-lavender-400",
  },
  {
    id: "moonlight",
    name: "Moonlight",
    colorClass: "bg-moonlight-400",
    textClass: "text-moonlight-400",
  },
  {
    id: "teal",
    name: "Teal",
    colorClass: "bg-teal-400",
    textClass: "text-teal-400",
  },
  {
    id: "rose",
    name: "Rose",
    colorClass: "bg-rose-400",
    textClass: "text-rose-400",
  },
  {
    id: "amber",
    name: "Amber",
    colorClass: "bg-amber-400",
    textClass: "text-amber-400",
  },
  {
    id: "indigo",
    name: "Indigo",
    colorClass: "bg-indigo-400",
    textClass: "text-indigo-400",
  },
  {
    id: "mint",
    name: "Mint",
    colorClass: "bg-mint-400",
    textClass: "text-mint-400",
  },
  {
    id: "slate",
    name: "Slate",
    colorClass: "bg-slate-400",
    textClass: "text-slate-400",
  },
];
