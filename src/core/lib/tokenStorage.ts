// core/lib/tokenStorage.ts
import { storage } from "@/core/lib/storage";

const ACCESS_TOKEN_KEY = "auth.accessToken";
const REFRESH_TOKEN_KEY = "auth.refreshToken";

export const tokenStorage = {
  getAccessToken: (): string | null =>
    storage.getString(ACCESS_TOKEN_KEY) ?? null,
  getRefreshToken: (): string | null =>
    storage.getString(REFRESH_TOKEN_KEY) ?? null,

  setTokens: (accessToken: string, refreshToken: string) => {
    storage.set(ACCESS_TOKEN_KEY, accessToken);
    storage.set(REFRESH_TOKEN_KEY, refreshToken);
  },

  clearTokens: () => {
    storage.remove(ACCESS_TOKEN_KEY);
    storage.remove(REFRESH_TOKEN_KEY);
  },
};
