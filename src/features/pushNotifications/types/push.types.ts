// ---- Request Payloads ----

export interface RegisterPushDevicePayload {
  platform: "ios" | "android";
  token: string;
}

// ---- Raw Backend DTOs ----

export interface PushDeviceResponseDto {
  installationId: string;
  platform: "ios" | "android";
  registeredAt: string;
}
