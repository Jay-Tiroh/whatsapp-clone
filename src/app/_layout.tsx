import { useAppLockGate } from "@/core/hooks/useAppLockGate";
import { useAppReady } from "@/core/hooks/useAppReady";
import { useSocket } from "@/core/hooks/useSocket";
import AppProviders from "@/core/providers/AppProviders";
import { usePinStore } from "@/core/store/pinStore";
import { useAuthStore } from "@/features/auth";
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
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isProfileComplete = useAuthStore(
    (s) => s.user?.profileComplete === true,
  );
  // Signed in but still owing the name/avatar steps.
  const needsOnboarding = isAuthenticated && !isProfileComplete;
  const backgroundColor = useCSSVariable("--color-background") as
    string | undefined;
  const background = backgroundColor ?? "#F5F7F9";
  useAppLockGate();
  // The session owns the socket: restored sessions connect before any chat opens.
  useSocket();
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
          {/* (auth) is declared first so that when a guard blocks a route
              (deep link to a chat while signed out, logout, expired token)
              the navigator falls back to the login flow, not the welcome
              screen. */}
          <Stack.Protected guard={!isAuthenticated || needsOnboarding}>
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          </Stack.Protected>
          <Stack.Protected guard={!isAuthenticated}>
            <Stack.Screen name="index" options={{ headerShown: false }} />
          </Stack.Protected>
          <Stack.Protected guard={isAuthenticated && isProfileComplete}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          </Stack.Protected>
        </Stack>
        {hasSetupPin && isLocked && <PinLockScreen />}
      </View>
      <Toast config={toastConfig} position="bottom" swipeable />
    </AppProviders>
  );
}
