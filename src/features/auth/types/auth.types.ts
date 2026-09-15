import { UserResponseDto } from "@/features/profile"; // Assuming this is updated in the profile/user batch

export type AuthPlatform = "ios" | "android" | "web" | "unknown";

export interface AuthDeviceDto {
  name?: string;
  platform: AuthPlatform;
}

// ---- Request Payloads ----

export interface RequestOtpDto {
  phoneNumber: string;
}

export interface ResendOtpDto {
  challengeId: string;
}

export interface VerifyOtpDto {
  challengeId: string;
  code: string;
  device?: AuthDeviceDto;
}

export interface RefreshTokenDto {
  refreshToken: string;
}

// ---- Raw Response DTOs (Mapped away at API boundary) ----

export interface OtpChallengeResponseDto {
  challengeId: string;
  phoneNumberMasked: string;
  expiresInSeconds: number;
  resendInSeconds: number;
  codeLength: number;
}

export interface AuthResponseDto {
  accessToken: string;
  accessTokenExpiresInSeconds: number;
  refreshToken: string;
  refreshTokenExpiresInSeconds: number;
  user: UserResponseDto;
}

// ---- Application Domain Models ----

export interface OtpChallenge {
  challengeId: string;
  phoneNumberMasked: string;
  codeLength: number;
  resendInSeconds: number;
}

export interface User {
  id: string;
  phoneNumber: string;
  displayName: string | null;
  avatarUrl: string | null;
  profileComplete: boolean;
  createdAt: string;
}

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  user: User;
}
