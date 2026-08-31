// core/store/sheetStore.ts
import { ReactNode } from "react";
import { create } from "zustand";

interface SheetState {
  isOpen: boolean;
  sheetContent: ReactNode | null;
  snapPoints: (string | number)[];
  index: number;
  enablePanDownToClose: boolean;
  openSheet: (
    content: ReactNode,
    opts?: {
      snapPoints?: (string | number)[];
      index?: number;
      enablePanDownToClose?: boolean;
    },
  ) => void;
  closeSheet: () => void;
  clearSheet: () => void;
}

export const useSheetStore = create<SheetState>((set) => ({
  isOpen: false,
  sheetContent: null,
  snapPoints: ["50%"],
  index: 0,
  enablePanDownToClose: true,
  openSheet: (content, opts) =>
    set({
      isOpen: true,
      sheetContent: content,
      snapPoints: opts?.snapPoints ?? ["50%"],
      index: opts?.index ?? 0,
      enablePanDownToClose: opts?.enablePanDownToClose ?? true,
    }),
  closeSheet: () => set({ isOpen: false }),
  clearSheet: () => set({ sheetContent: null }),
}));
