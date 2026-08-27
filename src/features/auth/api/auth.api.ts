import { AUTH_ENDPOINTS } from "@/core/constants/endpoints";
import { api } from "@/core/lib/api";
import type {
  AuthResponseDto,
  AuthSession,
  OtpChallenge,
  OtpChallengeResponseDto,
  RefreshTokenDto,
  RequestOtpPayload,
  ResendOtpPayload,
  VerifyOtpPayload,
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
    displayName: dto.user.displayName,
    profileComplete: dto.user.profileComplete,
    phoneNumber: dto.user.phoneNumber,
    avatarUrl: dto.user.avatarUrl,
    createdAt: dto.user.createdAt,
    // map other properties 1:1 without DTO structures
  },
});

export const authApi = {
  requestOtp: async (payload: RequestOtpPayload): Promise<OtpChallenge> => {
    const { data } = await api.post<OtpChallengeResponseDto>(
      AUTH_ENDPOINTS.REQUEST_OTP,
      payload,
    );
    return mapOtpChallenge(data);
  },

  resendOtp: async (payload: ResendOtpPayload): Promise<OtpChallenge> => {
    const { data } = await api.post<OtpChallengeResponseDto>(
      AUTH_ENDPOINTS.RESEND_OTP,
      payload,
    );
    return mapOtpChallenge(data);
  },

  verifyOtp: async (payload: VerifyOtpPayload): Promise<AuthSession> => {
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
