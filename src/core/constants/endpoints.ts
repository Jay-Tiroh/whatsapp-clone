// core/constants/endpoints.ts
export const AUTH_ENDPOINTS = {
  REQUEST_OTP: "/v1/auth/otp/request",
  RESEND_OTP: "/v1/auth/otp/resend",
  VERIFY_OTP: "/v1/auth/otp/verify",
  REFRESH: "/v1/auth/refresh",
  LOGOUT: "/v1/auth/logout",
} as const;

// Endpoints where a 401 is a terminal error, never "access token expired" —
// the interceptor should never try to refresh+retry these.
export const AUTH_ENDPOINTS_SKIP_REFRESH: string[] =
  Object.values(AUTH_ENDPOINTS);
