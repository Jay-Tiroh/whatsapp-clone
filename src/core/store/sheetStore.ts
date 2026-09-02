import { ReactNode } from "react";
import { create } from "zustand";

type SheetDetent = number | "auto" | "peek";

interface SheetState {
  isOpen: boolean;
  sheetContent: ReactNode | null;
  detents: SheetDetent[];
  dismissible: boolean;
  scrollable: boolean;
  openSheet: (
    content: ReactNode,
    opts?: {
      detents?: SheetDetent[];
      dismissible?: boolean;
      scrollable?: boolean;
    },
  ) => void;
  closeSheet: () => void;
  clearSheet: () => void;
}

export const useSheetStore = create<SheetState>((set) => ({
  isOpen: false,
  sheetContent: null,
  detents: [0.5],
  dismissible: true,
  scrollable: false,
  openSheet: (content, opts) =>
    set({
      isOpen: true,
      sheetContent: content,
      detents: opts?.detents ?? [0.5],
      dismissible: opts?.dismissible ?? true,
      scrollable: opts?.scrollable ?? false,
    }),
  closeSheet: () => set({ isOpen: false }),
  clearSheet: () => set({ sheetContent: null }),
}));
