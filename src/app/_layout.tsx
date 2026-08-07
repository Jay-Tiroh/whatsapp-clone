import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { SafeAreaListener } from "react-native-safe-area-context";
import { Uniwind, useCSSVariable } from "uniwind";
import "../global.css";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    "SFProDisplay-Regular": require("@/assets/fonts/sf-pro-display/SFPRODISPLAYREGULAR.otf"),
    "SFProDisplay-Medium": require("@/assets/fonts/sf-pro-display/SFPRODISPLAYMEDIUM.otf"),
    "SFProDisplay-Semibold": require("@/assets/fonts/sf-pro-display/SFPRODISPLAYSEMIBOLDITALIC.otf"),
    "SFProDisplay-Bold": require("@/assets/fonts/sf-pro-display/SFPRODISPLAYBOLD.otf"),
  });

  const [isAppReady, setIsAppReady] = useState(false);
  const backgroundColor = useCSSVariable("--color-background") as
    string | undefined;

  useEffect(() => {
    async function prepareApp() {
      try {
        // Any API calls, MMKV/SQLite init, auth checks, etc. go here
        await new Promise((resolve) => setTimeout(resolve, 2000));
      } catch (e) {
        console.warn("Error during app initialization:", e);
      } finally {
        setIsAppReady(true);
      }
    }
    prepareApp();
  }, []);

  useEffect(() => {
    if (fontError) {
      console.warn("Font loading error:", fontError);
    }
  }, [fontError]);

  useEffect(() => {
    // Wait on BOTH the app-prep work and font loading, not just one
    if (isAppReady && (fontsLoaded || fontError)) {
      SplashScreen.hideAsync();
    }
  }, [isAppReady, fontsLoaded, fontError]);

  if (!isAppReady || (!fontsLoaded && !fontError)) {
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
            contentStyle: { backgroundColor: backgroundColor ?? "#F5F7F9" }, // fixed: matches --color-background light value
          }}
        >
          <Stack.Screen name="index" options={{ headerShown: false }} />
        </Stack>
      </View>
    </SafeAreaListener>
  );
}
