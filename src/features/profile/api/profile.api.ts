import { api } from "@/core/lib/api";
import type {
  UpdateProfilePayload,
  UserProfile,
  UserResponseDto,
} from "../types/profile.types";

const mapUserProfile = (dto: UserResponseDto): UserProfile => ({
  id: dto.id,
  phoneNumber: dto.phoneNumber,
  displayName: dto.displayName,
  avatarUrl: dto.avatarUrl,
  profileComplete: dto.profileComplete,
  createdAt: dto.createdAt,
});

export const profileApi = {
  getMe: async (): Promise<UserProfile> => {
    const { data } = await api.get<UserResponseDto>("/v1/me");
    return mapUserProfile(data);
  },

  updateProfile: async (
    payload: UpdateProfilePayload,
  ): Promise<UserProfile> => {
    const { data } = await api.patch<UserResponseDto>("/v1/me", payload);
    return mapUserProfile(data);
  },
};
