// ---- Request Payloads ----

// PATCH /v1/me
export interface UpdateProfileDto {
  displayName?: string;
}

// POST /v1/contacts/match
export interface MatchContactsDto {
  phoneNumbers: string[];
}

// PUT /v1/me/avatar
export interface SetProfileAvatarDto {
  mediaId: string;
}

// ---- Response DTOs ----

// GET /v1/me | PATCH /v1/me
export interface UserResponseDto {
  id: string;
  phoneNumber: string;
  displayName?: Record<string, never> | null;
  avatarUrl?: Record<string, never> | null;
  profileComplete: boolean;
  createdAt: string;
}

// Nested inside BlockResponseDto
export interface BlockedPublicUserDto {
  id: string;
  displayName: Record<string, never> | null;
  avatarUrl: string | null;
}

// PUT /v1/me/blocks/{userId}
export interface BlockResponseDto {
  user: BlockedPublicUserDto;
  blockedAt: string;
}

// GET /v1/me/blocks
export interface BlockListResponseDto {
  items: BlockResponseDto[];
}

// Nested inside ContactMatchDto / UserSearchResponseDto
export interface PublicDiscoveryUserDto {
  id: string;
  displayName: Record<string, never> | null;
  avatarUrl: string | null;
}

// Nested inside ContactMatchesResponseDto
export interface ContactMatchDto {
  matchedPhoneNumber: string;
  user: PublicDiscoveryUserDto;
}

// POST /v1/contacts/match
export interface ContactMatchesResponseDto {
  matches: ContactMatchDto[];
}

// GET /v1/users/search
export interface UserSearchResponseDto {
  items: PublicDiscoveryUserDto[];
  nextCursor: string | null;
}
