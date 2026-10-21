import type { components } from "@/core/types/api";

// ---- Raw DTO Types derived directly from OpenAPI schema ----

export type AuthPlatform = components["schemas"]["AuthDeviceDto"]["platform"];
export type AuthDeviceDto = components["schemas"]["AuthDeviceDto"];
export type RequestOtpDto = components["schemas"]["RequestOtpDto"];
export type ResendOtpDto = components["schemas"]["ResendOtpDto"];
export type VerifyOtpDto = components["schemas"]["VerifyOtpDto"];
export type RefreshTokenDto = components["schemas"]["RefreshTokenDto"];

export type OtpChallengeResponseDto =
  components["schemas"]["OtpChallengeResponseDto"];
export type UserResponseDto = components["schemas"]["UserResponseDto"];
export type AuthResponseDto = components["schemas"]["AuthResponseDto"];

// ---- Application Domain Models ----

export interface OtpChallenge {
  challengeId: string;
  phoneNumberMasked: string;
  codeLength: number;
  resendInSeconds: number;
  expiresInSeconds: number;
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
  accessTokenExpiresInSeconds: number;
  refreshToken: string;
  refreshTokenExpiresInSeconds: number;
  user: User;
}
