// app/_layout.tsx
import { useAppReady } from "@/core/hooks/useAppReady";
import AppProviders from "@/core/providers/AppProviders";
import { Stack } from "expo-router";
import { View } from "react-native";
import { useCSSVariable } from "uniwind";
import "../global.css";

export default function RootLayout() {
  const ready = useAppReady();
  const backgroundColor = useCSSVariable("--color-background") as
    string | undefined;

  if (!ready) return null;

  return (
    <AppProviders>
      <View className="flex-1 bg-background">
        <Stack
          screenOptions={{
            contentStyle: { backgroundColor: backgroundColor ?? "#F5F7F9" },
          }}
        >
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        </Stack>
      </View>
    </AppProviders>
  );
}
