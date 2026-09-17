import { AUTH_ENDPOINTS } from "@/core/constants/endpoints";
import { api } from "@/core/lib/api";
import type {
  AuthResponseDto,
  AuthSession,
  OtpChallenge,
  OtpChallengeResponseDto,
  RefreshTokenDto,
  RequestOtpDto,
  ResendOtpDto,
  VerifyOtpDto,
} from "../types/auth.types";

// --- DTO Mappers ---
const mapOtpChallenge = (dto: OtpChallengeResponseDto): OtpChallenge => ({
  challengeId: dto.challengeId,
  phoneNumberMasked: dto.phoneNumberMasked,
  codeLength: dto.codeLength,
  resendInSeconds: dto.resendInSeconds,
});

const mapAuthResponse = (dto: AuthResponseDto): AuthSession => ({
  accessToken: dto.accessToken,
  refreshToken: dto.refreshToken,
  user: {
    id: dto.user.id,
    // Safely parse DTO shape mismatch (Record<string, never> | null vs string | null)
    displayName:
      typeof dto.user.displayName === "string" ? dto.user.displayName : null,
    profileComplete: dto.user.profileComplete,
    phoneNumber: dto.user.phoneNumber,
    // Safely parse DTO shape mismatch
    avatarUrl:
      typeof dto.user.avatarUrl === "string" ? dto.user.avatarUrl : null,
    createdAt: dto.user.createdAt,
  },
});

export const authApi = {
  requestOtp: async (payload: RequestOtpDto): Promise<OtpChallenge> => {
    const { data } = await api.post<OtpChallengeResponseDto>(
      AUTH_ENDPOINTS.REQUEST_OTP,
      payload,
    );
    return mapOtpChallenge(data);
  },

  resendOtp: async (payload: ResendOtpDto): Promise<OtpChallenge> => {
    const { data } = await api.post<OtpChallengeResponseDto>(
      AUTH_ENDPOINTS.RESEND_OTP,
      payload,
    );
    return mapOtpChallenge(data);
  },

  verifyOtp: async (payload: VerifyOtpDto): Promise<AuthSession> => {
    const { data } = await api.post<AuthResponseDto>(
      AUTH_ENDPOINTS.VERIFY_OTP,
      payload,
    );
    return mapAuthResponse(data);
  },

  refresh: async (payload: RefreshTokenDto): Promise<AuthSession> => {
    const { data } = await api.post<AuthResponseDto>(
      AUTH_ENDPOINTS.REFRESH,
      payload,
    );
    return mapAuthResponse(data);
  },

  logout: async (payload: RefreshTokenDto): Promise<void> => {
    await api.post(AUTH_ENDPOINTS.LOGOUT, payload);
  },
};
