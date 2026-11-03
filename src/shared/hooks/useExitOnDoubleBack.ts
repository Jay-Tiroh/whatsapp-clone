// hooks/useExitOnDoubleBack.ts
import { showInfoToast } from "@/shared/hooks/showToast";
import { useFocusEffect } from "expo-router";
import { useCallback, useRef } from "react";
import { BackHandler } from "react-native";

export function useExitOnDoubleBack(
  message: string = "Press back again to exit",
) {
  const backPressedOnce = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (backPressedOnce.current) {
          if (timerRef.current) clearTimeout(timerRef.current);
          BackHandler.exitApp();
          return true;
        }

        backPressedOnce.current = true;
        // ToastAndroid.show(message, ToastAndroid.SHORT);
        showInfoToast({ title: "Exit App", message });

        timerRef.current = setTimeout(() => {
          backPressedOnce.current = false;
        }, 2000);

        return true; // always handled on home — never let it bubble to exit directly
      };

      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress,
      );

      return () => {
        subscription.remove();
        if (timerRef.current) clearTimeout(timerRef.current);
        backPressedOnce.current = false;
      };
    }, [message]),
  );
}
