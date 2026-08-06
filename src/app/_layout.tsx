import "../global.css";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { SafeAreaListener } from "react-native-safe-area-context";
import { Uniwind, useCSSVariable } from "uniwind";
// 1. Prevent the splash screen from auto-hiding immediately
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [isAppReady, setIsAppReady] = useState(false);
  const backgroundColor = useCSSVariable("--color-background") as
    string | undefined;
  console.log(backgroundColor);
  useEffect(() => {
    async function prepareApp() {
      try {
        // Pre-load fonts, make any API calls you need to do here,
        // initialize your MMKV storage, SQLite database, or check Auth state.

        // Example: await Font.loadAsync(customFonts);
        // Example: await initializeDatabase();

        // Artificially delay for demonstration (remove in production)
        await new Promise((resolve) => setTimeout(resolve, 2000));
      } catch (e) {
        console.warn("Error during app initialization:", e);
      } finally {
        // Tell the application to render
        setIsAppReady(true);
      }
    }

    prepareApp();
  }, []);

  useEffect(() => {
    if (isAppReady) {
      // 2. Hide the splash screen once everything is loaded
      SplashScreen.hideAsync();
    }
  }, [isAppReady]);

  if (!isAppReady) {
    // Return null to keep the native splash screen mounted while we prepare
    return null;
  }

  return (
    <SafeAreaListener
      onChange={({ insets }) => {
        Uniwind.updateInsets(insets);
      }}
    >
      <View className="flex-1 bg-background">
        <Stack
          screenOptions={{
            contentStyle: { backgroundColor: backgroundColor ?? "#e6f4fe" },
          }}
        >
          <Stack.Screen name="index" options={{ headerShown: false }} />
        </Stack>
      </View>
    </SafeAreaListener>
  );
}
