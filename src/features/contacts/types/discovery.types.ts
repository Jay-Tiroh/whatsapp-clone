// types/discovery.types.ts

// ---- Request Payloads ----
// Note: We keep this locally because it represents query params, not a JSON body DTO.
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
