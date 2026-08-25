// features/auth/hooks/useAuth.ts

import { tokenStorage } from "@/core/lib/tokenStorage";
import { useAuthStore } from "@/core/store/authStore";
import { useMutation } from "@tanstack/react-query";
import { authApi } from "../api/auth.api";
import type {
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

export function useLogout() {
  const clearSession = useAuthStore((s) => s.clearSession);

  return useMutation({
    mutationFn: () => {
      const refreshToken = tokenStorage.getRefreshToken();
      return authApi.logout({ refreshToken: refreshToken! });
    },
    onSettled: () => {
      // Clear locally regardless of API outcome — a failed logout
      // shouldn't trap the user in a dead session.
      tokenStorage.clearTokens();
      clearSession();
    },
  });
}
