import { useSheetStore } from "@/core/store/sheetStore";
import { TrueSheet } from "@lodev09/react-native-true-sheet";
import { useEffect, useRef } from "react";

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
    <TrueSheet
      ref={sheetRef}
      detents={detents}
      scrollable={scrollable}
      dismissible={dismissible}
      draggable={dismissible}
      dimmed
      grabber
      cornerRadius={24}
      backgroundColor="#173247"
      onDidDismiss={() => {
        closeSheet();
        clearSheet();
      }}
    >
      {sheetContent}
    </TrueSheet>
  );
}
