import { useSheetStore } from "@/core/store/sheetStore";
import { TrueSheet } from "@lodev09/react-native-true-sheet";
import { useEffect, useRef } from "react";
import { withUniwind } from "uniwind";

const StyledSheet = withUniwind(TrueSheet);
export default function GlobalBottomSheet() {
  const sheetRef = useRef<TrueSheet>(null);
  const {
    isOpen,
    sheetContent,
    detents,
    dismissible,
    scrollable,
    closeSheet,
    clearSheet,
  } = useSheetStore();

  useEffect(() => {
    if (isOpen) {
      sheetRef.current?.present();
    } else {
      sheetRef.current?.dismiss();
    }
  }, [isOpen]);

  return (
    <StyledSheet
      ref={sheetRef}
      // style={{ flex: 1 }}
      backgroundColorClassName="accent-white dark:accent-neutral-700"
      detents={detents}
      scrollable={scrollable}
      dismissible={dismissible}
      draggable={dismissible}
      dimmed
      grabber
      cornerRadius={24}
      onDidDismiss={() => {
        closeSheet();
        clearSheet();
      }}
    >
      {sheetContent}
    </StyledSheet>
  );
}
