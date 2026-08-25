import type { UserResponseDto } from "../types/auth.types";

export type AuthDestination = "/login" | "/name" | "/upload" | "/(tabs)";

export function getAuthDestination(
  isAuthenticated: boolean,
  user: UserResponseDto | null,
): AuthDestination {
  if (!isAuthenticated || !user) return "/login";
  if (user.profileComplete) return "/(tabs)";
  if (!user.displayName) return "/name";
  return "/upload";
}
