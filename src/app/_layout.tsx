import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";

// 1. Prevent the splash screen from auto-hiding immediately
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [isAppReady, setIsAppReady] = useState(false);

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
    <Stack>
      {/* Configure your root navigation here */}
      <Stack.Screen name="index" options={{ headerShown: false }} />
    </Stack>
  );
}
