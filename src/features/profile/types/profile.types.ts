// ---- Request Payloads ----

export interface UpdateProfilePayload {
  displayName: string;
  avatarUrl?: string;
}

// ---- Raw Backend DTOs ----

export interface UserResponseDto {
  id: string;
  phoneNumber: string;
  displayName: string | null;
  avatarUrl: string | null;
  profileComplete: boolean;
  createdAt: string;
}

// ---- Application Domain Models ----

export interface UserProfile {
  id: string;
  phoneNumber: string;
  displayName: string | null;
  avatarUrl: string | null;
  profileComplete: boolean;
  createdAt: string;
}
