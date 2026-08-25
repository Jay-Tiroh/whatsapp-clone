// features/auth/types/auth.types.ts

export type AuthPlatform = "ios" | "android" | "web" | "unknown";

export interface AuthDevice {
  name?: string;
  platform?: AuthPlatform;
}

// ---- Request DTOs ----

export interface RequestOtpDto {
  phoneNumber: string; // E.164, e.g. +2348012345678
}

export interface ResendOtpDto {
  challengeId: string; // uuid
}

export interface VerifyOtpDto {
  challengeId: string;
  code: string;
  device?: AuthDevice;
}

export interface RefreshTokenDto {
  refreshToken: string;
}

// ---- Response DTOs ----

export interface OtpChallengeResponseDto {
  challengeId: string;
  phoneNumberMasked: string;
  expiresInSeconds: number;
  resendInSeconds: number;
  codeLength: number;
}

export interface UserResponseDto {
  id: string;
  phoneNumber: string;
  displayName: string | null;
  avatarUrl: string | null;
  profileComplete: boolean;
  createdAt: string; // ISO date-time
}

export interface AuthResponseDto {
  accessToken: string;
  accessTokenExpiresInSeconds: number;
  refreshToken: string;
  refreshTokenExpiresInSeconds: number;
  user: UserResponseDto;
}
