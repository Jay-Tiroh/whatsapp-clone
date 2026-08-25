import { useAuthStore } from "@/core/store/authStore";
import { Redirect, Stack } from "expo-router";
import { View } from "react-native";
import { useCSSVariable } from "uniwind";
export default function AuthLayout() {
  const backgroundColor = useCSSVariable("--color-background") as
    string | undefined;
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (isAuthenticated) {
    return <Redirect href="/chats" />;
  }
  return (
    <View className="flex-1 bg-background">
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: backgroundColor ?? "#F5F7F9" }, // fixed: matches --color-background light value
        }}
      >
        <Stack.Screen name="login" />
      </Stack>
    </View>
  );
}
