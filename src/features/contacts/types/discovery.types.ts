import type { components } from "@/core/types/api";

// ---- Raw DTO Types derived directly from OpenAPI schema ----

export type MatchContactsDto = components["schemas"]["MatchContactsDto"];
export type PublicDiscoveryUserDto =
  components["schemas"]["PublicDiscoveryUserDto"];
export type ContactMatchDto = components["schemas"]["ContactMatchDto"];
export type ContactMatchesResponseDto =
  components["schemas"]["ContactMatchesResponseDto"];
export type UserSearchResponseDto =
  components["schemas"]["UserSearchResponseDto"];

// ---- Request Payloads ----

export interface SearchUsersQueryPayload {
  q: string;
  limit?: number;
  cursor?: string;
}

// ---- Application Domain Models ----

export interface DiscoveredUser {
  id: string;
  displayName: string | null;
  avatarUrl: string | null;
}

export interface ContactMatch {
  matchedPhoneNumber: string;
  user: DiscoveredUser;
}
