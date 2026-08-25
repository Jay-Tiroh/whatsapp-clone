// features/profile/types/profile.types.ts

export interface UserResponseDto {
  id: string;
  phoneNumber: string;
  displayName: string | null;
  avatarUrl: string | null;
  profileComplete: boolean;
  createdAt: string;
}

export interface UpdateProfileRequestDto {
  displayName: string;
  avatarUrl?: string;
}
