// api/profile.api.ts
import { api } from "@/core/lib/api";
import type { BlockedUser, UserProfile } from "../types/profile.types";
import type {
  BlockListResponseDto,
  BlockResponseDto,
  SetProfileAvatarDto,
  UpdateProfileDto,
  UserResponseDto,
} from "../types/user.types";

const mapUserProfile = (dto: UserResponseDto): UserProfile => ({
  id: dto.id,
  phoneNumber: dto.phoneNumber,
  // Cast safely addresses the Record<string, never> OpenAPI generation quirk
  displayName: (dto.displayName as unknown as string) ?? null,
  avatarUrl: (dto.avatarUrl as unknown as string) ?? null,
  profileComplete: dto.profileComplete,
  createdAt: dto.createdAt,
});

const mapBlockedUser = (dto: BlockResponseDto): BlockedUser => ({
  id: dto.user.id,
  displayName: (dto.user.displayName as unknown as string) ?? null,
  avatarUrl: dto.user.avatarUrl,
  blockedAt: dto.blockedAt,
});

export const profileApi = {
  getMe: async (): Promise<UserProfile> => {
    const { data } = await api.get<UserResponseDto>("/v1/me");
    return mapUserProfile(data);
  },

  updateProfile: async (payload: UpdateProfileDto): Promise<UserProfile> => {
    const { data } = await api.patch<UserResponseDto>("/v1/me", payload);
    return mapUserProfile(data);
  },

  setAvatar: async (payload: SetProfileAvatarDto): Promise<UserProfile> => {
    const { data } = await api.put<UserResponseDto>("/v1/me/avatar", payload);
    return mapUserProfile(data);
  },

  removeAvatar: async (): Promise<void> => {
    await api.delete("/v1/me/avatar");
  },

  getBlocks: async (): Promise<BlockedUser[]> => {
    const { data } = await api.get<BlockListResponseDto>("/v1/me/blocks");
    return data.items.map(mapBlockedUser);
  },

  blockUser: async (userId: string): Promise<BlockedUser> => {
    const { data } = await api.put<BlockResponseDto>(`/v1/me/blocks/${userId}`);
    return mapBlockedUser(data);
  },

  unblockUser: async (userId: string): Promise<void> => {
    await api.delete(`/v1/me/blocks/${userId}`);
  },
};
