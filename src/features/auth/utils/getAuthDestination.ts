import type { UserResponseDto } from "../types/auth.types";

export type AuthDestination = "/login" | "/name" | "/upload" | "/chats";

export function getAuthDestination(
  isAuthenticated: boolean,
  user: UserResponseDto | null,
): AuthDestination {
  if (!isAuthenticated || !user) return "/login";
  if (user.profileComplete) return "/chats";
  if (!user.displayName) return "/name";
  return "/upload";
}
