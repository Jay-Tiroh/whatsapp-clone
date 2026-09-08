// hooks/useAppReady.ts
import { api } from "@/core/lib/api";
import { tokenStorage } from "@/core/lib/tokenStorage";
import { useAuthStore } from "@/features/auth";
import { getAuthDestination } from "@/features/auth/utils/getAuthDestination";
import axios from "axios";
import { useFonts } from "expo-font";
import { useEffect, useState } from "react";

export const useAppReady = () => {
  const [fontsLoaded, fontError] = useFonts({
    "SFProDisplay-Regular": require("@/assets/fonts/sf-pro-display/SFPRODISPLAYREGULAR.otf"),
    "SFProDisplay-Medium": require("@/assets/fonts/sf-pro-display/SFPRODISPLAYMEDIUM.otf"),
    "SFProDisplay-Semibold": require("@/assets/fonts/sf-pro-display/SFPRODISPLAYSEMIBOLD.ttf"),
    "SFProDisplay-Bold": require("@/assets/fonts/sf-pro-display/SFPRODISPLAYBOLD.otf"),
  });

  const hasStoreHydrated = useAuthStore((s) => s.hasHydrated);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);

  const [isValidated, setIsValidated] = useState(false);

  useEffect(() => {
    // Wait for MMKV → Zustand rehydration first, so `isAuthenticated`/`user`
    // reflect the last known session before we decide whether to hit the network.
    if (!hasStoreHydrated) return;

    let mounted = true;

    const prepareApp = async () => {
      const token = tokenStorage.getAccessToken();

      if (!token) {
        if (mounted) setIsValidated(true);
        return;
      }

      try {
        const { data } = await api.get("/v1/me", { timeout: 5000 });
        if (mounted) useAuthStore.getState().hydrateUser(data);
      } catch (error) {
        const status = axios.isAxiosError(error)
          ? error.response?.status
          : undefined;
        // Only a definitive 401/400 from /v1/me (after the refresh interceptor already
        // tried and failed) means the session is actually invalid. Timeouts, network
        // errors, and 5xxs are transient — keep the existing session and let the user
        // retry, rather than logging them out.
        if (status === 401 || status === 400) {
          if (mounted) useAuthStore.getState().clearSession();
        }
      } finally {
        if (mounted) setIsValidated(true);
      }
    };

    prepareApp();
    return () => {
      mounted = false;
    };
  }, [hasStoreHydrated]);

  useEffect(() => {
    if (fontError) console.warn("Font loading error:", fontError);
  }, [fontError]);

  const isFullyReady =
    hasStoreHydrated && isValidated && (fontsLoaded || !!fontError);

  return {
    isReady: isFullyReady,
    // Only trust this once isReady is true — before that, isAuthenticated/user
    // may still reflect the pre-hydration defaults.
    initialDestination: getAuthDestination(isAuthenticated, user),
  };
};
