// types/discovery.types.ts

// ---- Request Payloads ----
export interface MatchContactsPayload {
  phoneNumbers: string[];
}

export interface SearchUsersQueryPayload {
  q: string;
  limit?: number;
  cursor?: string;
}

// ---- Raw Backend DTOs ----
export interface DiscoveredUserDto {
  id: string;
  displayName: string | null;
  avatarUrl: string | null;
}

export interface ContactMatchDto {
  matchedPhoneNumber: string;
  user: DiscoveredUserDto;
}

export interface MatchContactsResponseDto {
  matches: ContactMatchDto[];
}

export interface SearchUsersResponseDto {
  items: DiscoveredUserDto[];
  nextCursor: string | null;
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
