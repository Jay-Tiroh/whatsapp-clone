// shared/components/GlobalBottomSheet.tsx
import { useSheetStore } from "@/core/store/sheetStore";
import BlurBackdrop from "@/shared/components/BlurBackdrop";
import {
  BottomSheetBackdropProps,
  BottomSheetModal,
} from "@gorhom/bottom-sheet";
import { useCallback, useEffect, useRef } from "react";
import { Text, View } from "react-native";

export default function GlobalBottomSheet() {
  const bottomSheetRef = useRef<BottomSheetModal>(null);

  const {
    isOpen,
    sheetContent,
    snapPoints,
    enablePanDownToClose,
    closeSheet,
    clearSheet,
  } = useSheetStore();

  // in GlobalBottomSheet.tsx
  useEffect(() => {
    console.log(
      "[sheet] isOpen changed:",
      isOpen,
      "ref:",
      bottomSheetRef.current,
    );
    if (isOpen) {
      bottomSheetRef.current?.present();
      console.log("[sheet] present() called");
    } else {
      bottomSheetRef.current?.dismiss();
    }
  }, [isOpen]);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => <BlurBackdrop {...props} />,
    [],
  );

  return (
    <BottomSheetModal
      animateOnMount={false}
      ref={bottomSheetRef}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose={enablePanDownToClose}
      enableDynamicSizing={false}
      onDismiss={() => {
        closeSheet();
        clearSheet();
      }}
      backgroundStyle={{ backgroundColor: "red" }}
    >
      <View style={{ padding: 20 }}>
        <Text>TEST</Text>
      </View>
    </BottomSheetModal>
  );
  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose={enablePanDownToClose}
      enableDynamicSizing={false}
      backdropComponent={renderBackdrop}
      onDismiss={() => {
        closeSheet();
        clearSheet();
      }}
      backgroundStyle={{
        backgroundColor: "#173247",
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
      }}
      handleIndicatorStyle={{
        backgroundColor: "#526f82",
        width: 48,
        height: 6,
      }}
    >
      {sheetContent}
    </BottomSheetModal>
  );
}
