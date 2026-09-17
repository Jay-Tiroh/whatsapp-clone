// features/auth/hooks/useLogout.ts
import { authApi } from "@/features/auth/api/auth.api";
import { useAuthStore } from "@/features/auth/store/authStore";
import { showSuccessToast, showWarningToast } from "@/shared/hooks/showToast";
import { useMutation } from "@tanstack/react-query";
export function useLogout() {
  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      useAuthStore.getState().clearSession();
      showSuccessToast({
        title: "Logged out",
        message: "You have been logged out successfully.",
      });
    },
    onError: () => {
      // Even if the server call fails, you generally still want to
      // clear local session — a dead/expired token shouldn't trap
      // the user logged in on-device.
      useAuthStore.getState().clearSession();
      showWarningToast({
        title: "Error logging out",
        message:
          "An unknown error occurred while logging out. You have been logged out locally.",
      });
    },
  });
}
