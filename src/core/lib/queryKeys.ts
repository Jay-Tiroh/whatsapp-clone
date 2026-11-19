import { useAuthStore } from "@/features/auth/store/authStore";

/**
 * Account id used to scope private query keys. Two accounts never share a key,
 * so one account's cached data can never be read while another is signed in.
 */
export function useAccountId(): string {
  return useAuthStore((state) => state.user?.id) ?? "anonymous";
}
