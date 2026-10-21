import type { components } from "@/core/types/api";

// ---- Raw DTO Types derived directly from OpenAPI schema ----

export type UpdateProfileDto = components["schemas"]["UpdateProfileDto"];
export type MatchContactsDto = components["schemas"]["MatchContactsDto"];
export type SetProfileAvatarDto = components["schemas"]["SetProfileAvatarDto"];
export type UserResponseDto = components["schemas"]["UserResponseDto"];
export type BlockedPublicUserDto =
  components["schemas"]["BlockedPublicUserDto"];
export type BlockResponseDto = components["schemas"]["BlockResponseDto"];
export type BlockListResponseDto =
  components["schemas"]["BlockListResponseDto"];
export type PublicDiscoveryUserDto =
  components["schemas"]["PublicDiscoveryUserDto"];
export type ContactMatchDto = components["schemas"]["ContactMatchDto"];
export type ContactMatchesResponseDto =
  components["schemas"]["ContactMatchesResponseDto"];
export type UserSearchResponseDto =
  components["schemas"]["UserSearchResponseDto"];
export type RegisterPushDeviceDto =
  components["schemas"]["RegisterPushDeviceDto"];
export type PushDeviceResponseDto =
  components["schemas"]["PushDeviceResponseDto"];
