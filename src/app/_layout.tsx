import { useAppLockGate } from "@/core/hooks/useAppLockGate";
import { useAppReady } from "@/core/hooks/useAppReady";
import AppProviders from "@/core/providers/AppProviders";
import { usePinStore } from "@/core/store/pinStore";
import { PinLockScreen } from "@/features/settings";
import { toastConfig } from "@/shared/constants/toastConfig";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { View } from "react-native";
import Toast from "react-native-toast-message";
import { useCSSVariable } from "uniwind";
import "../global.css";
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { isReady, initialDestination } = useAppReady();
  const backgroundColor = useCSSVariable("--color-background") as
    string | undefined;
  const background = backgroundColor ?? "#F5F7F9";
  useAppLockGate();
  const isLocked = usePinStore((s) => s.isLocked);
  const hasSetupPin = usePinStore((s) => s.hasSetupPin);
  useEffect(() => {
    if (isReady) {
      SplashScreen.hideAsync();
    }
  }, [isReady]);

  if (!isReady) {
    return null;
  }

  return (
    <AppProviders>
      <View style={{ flex: 1, backgroundColor: background }}>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: background },
            animation: "slide_from_right",
            animationTypeForReplace: "push",
            animationDuration: 300,
          }}
        >
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
        {hasSetupPin && isLocked && <PinLockScreen />}
      </View>
      <Toast config={toastConfig} />
    </AppProviders>
  );
}
