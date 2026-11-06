// core/lib/api.ts
import {
  AUTH_ENDPOINTS,
  AUTH_ENDPOINTS_SKIP_REFRESH,
} from "@/core/constants/endpoints";
import { teardownSession } from "@/core/lib/session";
import { getSessionGeneration } from "@/core/lib/sessionGeneration";
import { tokenStorage } from "@/core/lib/tokenStorage";
import axios, { InternalAxiosRequestConfig } from "axios";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;
const REFRESH_TIMEOUT_MS = 10_000;

type SessionConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
  _sessionGeneration?: number;
};

class StaleSessionError extends Error {}
class SessionExpiredError extends Error {}

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const c = config as SessionConfig;
  // Stamp once; retries keep the original stamp.
  c._sessionGeneration ??= getSessionGeneration();

  const token = tokenStorage.getAccessToken();
  if (token) c.headers.Authorization = `Bearer ${token}`;
  return c;
});

// --- single-flight refresh, scoped to a session generation ---
let refresh: { generation: number; promise: Promise<void> } | null = null;

function refreshAccessToken(): Promise<void> {
  const generation = getSessionGeneration();
  if (refresh?.generation === generation) return refresh.promise;

  const refreshToken = tokenStorage.getRefreshToken();
  if (!refreshToken) return Promise.reject(new SessionExpiredError());

  const promise: Promise<void> = axios
    // plain axios, not `api`: avoids re-entering this interceptor
    .post(
      `${BASE_URL}${AUTH_ENDPOINTS.REFRESH}`,
      { refreshToken },
      { timeout: REFRESH_TIMEOUT_MS },
    )
    .then(({ data }) => {
      // The user logged out or switched accounts while this was in flight.
      if (getSessionGeneration() !== generation) throw new StaleSessionError();
      tokenStorage.setTokens(data.accessToken, data.refreshToken);
    })
    .finally(() => {
      if (refresh?.promise === promise) refresh = null;
    });

  refresh = { generation, promise };
  return promise;
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config as SessionConfig | undefined;
    const isAuthEndpoint = AUTH_ENDPOINTS_SKIP_REFRESH.some((path) =>
      original?.url?.includes(path),
    );

    if (
      !original ||
      error.response?.status !== 401 ||
      original._retry ||
      isAuthEndpoint
    ) {
      return Promise.reject(error);
    }

    // Request belongs to a session that no longer exists: don't refresh or retry.
    const requestGeneration =
      original._sessionGeneration ?? getSessionGeneration();
    if (requestGeneration !== getSessionGeneration()) {
      return Promise.reject(error);
    }

    original._retry = true;

    try {
      await refreshAccessToken();
      // The request interceptor re-reads the fresh token on retry.
      return api(original);
    } catch (refreshError) {
      if (refreshError instanceof StaleSessionError) {
        return Promise.reject(error);
      }

      const status = axios.isAxiosError(refreshError)
        ? refreshError.response?.status
        : undefined;

      // Only a definitive rejection means the refresh token is dead.
      // Network errors, timeouts and 5xx are transient: keep the session.
      const isDead =
        refreshError instanceof SessionExpiredError ||
        status === 400 ||
        status === 401;

      // Several queued requests can land here together; only the first tears down.
      if (isDead && getSessionGeneration() === requestGeneration) {
        teardownSession();
      }

      return Promise.reject(refreshError);
    }
  },
);
