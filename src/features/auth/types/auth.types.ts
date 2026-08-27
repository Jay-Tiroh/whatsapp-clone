export type AuthPlatform = "ios" | "android" | "web" | "unknown";

export interface AuthDevice {
  name?: string;
  platform?: AuthPlatform;
}

// ---- Request Payloads ----

export interface RequestOtpPayload {
  phoneNumber: string; // E.164, e.g. +2348012345678
}

export interface ResendOtpPayload {
  challengeId: string; // uuid
}

export interface VerifyOtpPayload {
  challengeId: string;
  code: string;
  device?: AuthDevice;
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
