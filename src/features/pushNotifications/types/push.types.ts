import type { components } from "@/core/types/api";

// ---- Raw DTO Types derived directly from OpenAPI schema ----

export type RegisterPushDeviceDto =
  components["schemas"]["RegisterPushDeviceDto"];
export type PushDeviceResponseDto =
  components["schemas"]["PushDeviceResponseDto"];

// ---- Legacy Payload Aliases ----

export type RegisterPushDevicePayload = RegisterPushDeviceDto;
