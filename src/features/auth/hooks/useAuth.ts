import { teardownSession } from "@/core/lib/session";
import { getSessionGeneration } from "@/core/lib/sessionGeneration";
import { tokenStorage } from "@/core/lib/tokenStorage";
import { showSuccessToast, showWarningToast } from "@/shared/hooks/showToast";
import { useMutation } from "@tanstack/react-query";
import { useRef } from "react";
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
  // The logged-out generation. A logout that completes after a newer session
  // exists must not report anything (or tear that session down).
  const loggedOutGeneration = useRef<number | null>(null);

  const isStillLoggedOut = () =>
    loggedOutGeneration.current !== null &&
    loggedOutGeneration.current === getSessionGeneration();

  return useMutation({
    mutationFn: async () => {
      const refreshToken = tokenStorage.getRefreshToken();
      const accessToken = tokenStorage.getAccessToken();

      // Clear the local session at the very start: the UI must never wait on
      // the network to finish logging out.
      teardownSession();
      loggedOutGeneration.current = getSessionGeneration();

      if (refreshToken) {
        await authApi.logout({ refreshToken }, accessToken);
      }
    },
    onSuccess: () => {
      if (!isStillLoggedOut()) return;
      showSuccessToast({
        title: "Logged out",
        message: "You have been logged out successfully.",
      });
    },
    onError: () => {
      if (!isStillLoggedOut()) return;
      // Server call failed, but the user must never be trapped logged in.
      showWarningToast({
        title: "Error logging out",
        message:
          "An unknown error occurred while logging out. You have been logged out locally.",
      });
    },
  });
}
