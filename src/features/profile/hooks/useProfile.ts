// features/profile/hooks/useProfile.ts
import { useMutation, useQuery } from "@tanstack/react-query";
import { profileApi } from "../api/profile.api";
import type { UpdateProfileRequestDto } from "../types/profile.types";

export const useGetProfile = () => {
  return useQuery({
    queryKey: ["profile", "me"],
    queryFn: profileApi.getMe,
  });
};

export const useUpdateProfile = () => {
  return useMutation({
    mutationFn: (data: UpdateProfileRequestDto) =>
      profileApi.updateProfile(data),
  });
};
