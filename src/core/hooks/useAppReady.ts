// @/core/hooks/useAppReady.ts
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";

SplashScreen.preventAutoHideAsync();

export const useAppReady = () => {
  const [fontsLoaded, fontError] = useFonts({
    "SFProDisplay-Regular": require("@/assets/fonts/sf-pro-display/SFPRODISPLAYREGULAR.otf"),
    "SFProDisplay-Medium": require("@/assets/fonts/sf-pro-display/SFPRODISPLAYMEDIUM.otf"),
    "SFProDisplay-Semibold": require("@/assets/fonts/sf-pro-display/SFPRODISPLAYSEMIBOLDITALIC.otf"),
    "SFProDisplay-Bold": require("@/assets/fonts/sf-pro-display/SFPRODISPLAYBOLD.otf"),
  });
  const [isAppReady, setIsAppReady] = useState(false);

  useEffect(() => {
    async function prepareApp() {
      try {
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
    if (fontError) console.warn("Font loading error:", fontError);
  }, [fontError]);

  useEffect(() => {
    if (isAppReady && (fontsLoaded || fontError)) {
      SplashScreen.hideAsync();
    }
  }, [isAppReady, fontsLoaded, fontError]);

  return isAppReady && (fontsLoaded || fontError);
};
