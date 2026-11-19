import { useAuthStore } from "@/features/auth";
import { Stack } from "expo-router";
import { View } from "react-native";
import { useCSSVariable } from "uniwind";

export default function AuthLayout() {
  const backgroundColor = useCSSVariable("--color-background") as
    string | undefined;

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const displayName = useAuthStore((s) => s.user?.displayName ?? null);
  const isProfileComplete = useAuthStore(
    (s) => s.user?.profileComplete === true,
  );
  // Signed in but still owing onboarding steps. These users stay in this group
  // until `profileComplete` flips, which is parsed by the root guard too.
  const needsOnboarding = isAuthenticated && !isProfileComplete;

  return (
    <View className="flex-1 bg-background">
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: backgroundColor ?? "#F5F7F9" },
        }}
      >
        <Stack.Protected guard={!isAuthenticated}>
          <Stack.Screen name="login" />
          <Stack.Screen name="verify" />
        </Stack.Protected>
        <Stack.Protected guard={needsOnboarding && !displayName}>
          <Stack.Screen name="name" />
        </Stack.Protected>
        <Stack.Protected guard={needsOnboarding && !!displayName}>
          <Stack.Screen name="upload" />
        </Stack.Protected>
      </Stack>
    </View>
  );
}
