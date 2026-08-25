import { useAuthStore } from "@/core/store/authStore";
import { getAuthDestination } from "@/features/auth/utils/getAuthDestination";
import { Href, Redirect, Stack, useSegments } from "expo-router";
import { View } from "react-native";
import { useCSSVariable } from "uniwind";

export default function AuthLayout() {
  const backgroundColor = useCSSVariable("--color-background") as
    string | undefined;
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const segments = useSegments();
  const currentScreen = segments[segments.length - 1];

  const destination = getAuthDestination(isAuthenticated, user);
  // destination is "/login", "/name", "/upload", or "/(tabs)" — strip the leading slash to compare against the current segment
  const destinationScreen = destination
    .replace(/^\//, "")
    .replace(/^\(tabs\)$/, "chats");

  if (isAuthenticated && currentScreen !== destinationScreen) {
    return <Redirect href={destination as Href} />;
  }

  return (
    <View className="flex-1 bg-background">
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: backgroundColor ?? "#F5F7F9" },
        }}
      >
        <Stack.Screen name="login" />
        <Stack.Screen name="verify" />
        <Stack.Screen name="name" />
        <Stack.Screen name="upload" />
      </Stack>
    </View>
  );
}
