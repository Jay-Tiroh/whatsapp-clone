import { useMutation, useQuery } from "@tanstack/react-query";
import { profileApi } from "../api/profile.api";
import type { UpdateProfilePayload } from "../types/profile.types";

export const useGetProfile = () => {
  return useQuery({
    queryKey: ["profile", "me"],
    queryFn: profileApi.getMe,
    staleTime: 1000 * 60 * 2,
  });
};

export const useUpdateProfile = () => {
  return useMutation({
    mutationFn: (payload: UpdateProfilePayload) =>
      profileApi.updateProfile(payload),
  });
};
