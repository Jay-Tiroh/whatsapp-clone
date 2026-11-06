import { teardownSession } from "@/core/lib/session";
import { tokenStorage } from "@/core/lib/tokenStorage";
import { showSuccessToast, showWarningToast } from "@/shared/hooks/showToast";
import { useMutation } from "@tanstack/react-query";
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
  return useMutation({
    mutationFn: async () => {
      const refreshToken = tokenStorage.getRefreshToken();
      if (refreshToken) {
        await authApi.logout({ refreshToken });
      }
    },
    onSuccess: () => {
      showSuccessToast({
        title: "Logged out",
        message: "You have been logged out successfully.",
      });
    },
    onError: () => {
      // Server call failed, but the user must never be trapped logged in.
      showWarningToast({
        title: "Error logging out",
        message:
          "An unknown error occurred while logging out. You have been logged out locally.",
      });
    },
    onSettled: () => teardownSession(),
  });
}
