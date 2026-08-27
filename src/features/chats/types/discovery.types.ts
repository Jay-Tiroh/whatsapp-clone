export interface DiscoveredUserDto {
  id: string;
  displayName: string | null;
  avatarUrl: string | null;
}

export interface MatchContactsRequestDto {
  phoneNumbers: string[];
}

export interface ContactMatchDto {
  matchedPhoneNumber: string;
  user: DiscoveredUserDto;
}

export interface MatchContactsResponseDto {
  matches: ContactMatchDto[];
}

export interface SearchUsersQueryDto {
  q: string; // Required search term
  limit?: number; // Defaults to 20
  cursor?: string;
}

export interface SearchUsersResponseDto {
  items: DiscoveredUserDto[];
  nextCursor: string | null;
}
