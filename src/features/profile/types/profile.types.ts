import type { components } from "@/core/types/api";

// ---- Raw DTO Types derived directly from OpenAPI schema ----

export type RegisterPushDeviceDto =
  components["schemas"]["RegisterPushDeviceDto"];
export type PushDeviceResponseDto =
  components["schemas"]["PushDeviceResponseDto"];

// ---- Application Domain Models ----

export interface UserProfile {
  id: string;
  phoneNumber: string;
  displayName: string | null;
  avatarUrl: string | null;
  profileComplete: boolean;
  createdAt: string;
}

export interface BlockedUser {
  id: string;
  displayName: string | null;
  avatarUrl: string | null;
  blockedAt: string;
}

export interface PushDevice {
  installationId: string;
  platform: "ios" | "android";
  registeredAt: string;
}
