// lib/api.ts
import {
  AUTH_ENDPOINTS,
  AUTH_ENDPOINTS_SKIP_REFRESH,
} from "@/core/constants/endpoints";
import { tokenStorage } from "@/core/lib/tokenStorage";
import { useAuthStore } from "@/features/auth";
import axios from "axios";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = tokenStorage.getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// --- refresh queueing ---
let isRefreshing = false;
let refreshQueue: Array<(token: string | null) => void> = [];

function onRefreshed(token: string | null) {
  refreshQueue.forEach((cb) => cb(token));
  refreshQueue = [];
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const isAuthEndpoint = AUTH_ENDPOINTS_SKIP_REFRESH.some((path) =>
      originalRequest?.url?.includes(path),
    );

    if (
      error.response?.status !== 401 ||
      originalRequest._retry ||
      isAuthEndpoint
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        refreshQueue.push((token) => {
          if (!token) return reject(error);
          originalRequest.headers.Authorization = `Bearer ${token}`;
          resolve(api(originalRequest));
        });
      });
    }

    isRefreshing = true;
    const refreshToken = tokenStorage.getRefreshToken();

    if (!refreshToken) {
      isRefreshing = false;
      tokenStorage.clearTokens();
      return Promise.reject(error);
    }

    try {
      // plain axios call, not `api` — avoids re-triggering this same interceptor
      const { data } = await axios.post(
        `${BASE_URL}${AUTH_ENDPOINTS.REFRESH}`,
        {
          refreshToken,
        },
      );
      tokenStorage.setTokens(data.accessToken, data.refreshToken);
      onRefreshed(data.accessToken);
      originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      onRefreshed(null);
      useAuthStore.getState().clearSession();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);
