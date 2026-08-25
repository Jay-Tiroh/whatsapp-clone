// features/auth/api/auth.api.ts
import { AUTH_ENDPOINTS } from "@/core/constants/endpoints";
import { api } from "@/core/lib/api";
import type {
  AuthResponseDto,
  OtpChallengeResponseDto,
  RefreshTokenDto,
  RequestOtpDto,
  ResendOtpDto,
  VerifyOtpDto,
} from "../types/auth.types";

export const authApi = {
  requestOtp: async (
    payload: RequestOtpDto,
  ): Promise<OtpChallengeResponseDto> => {
    const { data } = await api.post<OtpChallengeResponseDto>(
      AUTH_ENDPOINTS.REQUEST_OTP,
      payload,
    );
    return data;
  },
  resendOtp: async (
    payload: ResendOtpDto,
  ): Promise<OtpChallengeResponseDto> => {
    const { data } = await api.post<OtpChallengeResponseDto>(
      AUTH_ENDPOINTS.RESEND_OTP,
      payload,
    );
    return data;
  },
  verifyOtp: async (payload: VerifyOtpDto): Promise<AuthResponseDto> => {
    const { data } = await api.post<AuthResponseDto>(
      AUTH_ENDPOINTS.VERIFY_OTP,
      payload,
    );
    return data;
  },
  refresh: async (payload: RefreshTokenDto): Promise<AuthResponseDto> => {
    const { data } = await api.post<AuthResponseDto>(
      AUTH_ENDPOINTS.REFRESH,
      payload,
    );
    return data;
  },
  logout: async (payload: RefreshTokenDto): Promise<void> => {
    await api.post(AUTH_ENDPOINTS.LOGOUT, payload);
  },
};
