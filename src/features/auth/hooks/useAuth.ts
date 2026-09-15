import { tokenStorage } from "@/core/lib/tokenStorage";
import { useAuthStore } from "@/features/auth/store/authStore";
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
      tokenStorage.clearTokens();
      clearSession();
    },
  });
}
