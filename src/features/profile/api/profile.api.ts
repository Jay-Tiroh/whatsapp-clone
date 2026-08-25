// features/profile/api/profile.api.ts
import { api } from "@/core/lib/api";
import type {
  UpdateProfileRequestDto,
  UserResponseDto,
} from "../types/profile.types";

export const profileApi = {
  getMe: async (): Promise<UserResponseDto> => {
    const response = await api.get<UserResponseDto>("/v1/me");
    return response.data;
  },

  updateProfile: async (
    data: UpdateProfileRequestDto,
  ): Promise<UserResponseDto> => {
    const response = await api.patch<UserResponseDto>("/v1/me", data);
    return response.data;
  },
};
