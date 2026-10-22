import { disconnectSocket } from "@/core/lib/socket";
import { tokenStorage } from "@/core/lib/tokenStorage";
import { useAuthStore } from "@/features/auth/store/authStore";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authApi } from "../api/auth.api";
import type {
  RefreshTokenDto,
  RequestOtpDto,
  ResendOtpDto,
  VerifyOtpDto,
} from "../types/auth.types";

export function useRequestOtp() {
  return useMutation({
    mutationFn: (payload: RequestOtpDto) => authApi.requestOtp(payload),
  });
}

export function useResendOtp() {
  return useMutation({
    mutationFn: (payload: ResendOtpDto) => authApi.resendOtp(payload),
  });
}

export function useVerifyOtp() {
  return useMutation({
    mutationFn: (payload: VerifyOtpDto) => authApi.verifyOtp(payload),
  });
}

export function useRefreshToken() {
  return useMutation({
    mutationFn: (payload: RefreshTokenDto) => authApi.refresh(payload),
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const clearSession = useAuthStore((s) => s.clearSession);

  return useMutation({
    mutationFn: async () => {
      const refreshToken = tokenStorage.getRefreshToken();
      if (refreshToken) {
        await authApi.logout({ refreshToken });
      }
    },
    onSettled: () => {
      // 1. Wipe local credentials
      tokenStorage.clearTokens();

      // 2. Clear user state
      clearSession();

      // 3. Disconnect Socket session
      disconnectSocket();

      // 4. Reset entire QueryClient cache to avoid data leakage between sessions
      queryClient.clear();
    },
  });
}
