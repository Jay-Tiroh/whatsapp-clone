// hooks/useProfile.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { profileApi } from "../api/profile.api";
import type {
  SetProfileAvatarDto,
  UpdateProfileDto,
} from "../types/user.types";

export const useGetProfile = () => {
  return useQuery({
    queryKey: ["profile", "me"],
    queryFn: profileApi.getMe,
    staleTime: 1000 * 60 * 2,
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateProfileDto) =>
      profileApi.updateProfile(payload),
    onSuccess: (data) => {
      // Optimistically update the cached profile
      queryClient.setQueryData(["profile", "me"], data);
    },
  });
};

export const useSetAvatar = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SetProfileAvatarDto) => profileApi.setAvatar(payload),
    onSuccess: (data) => {
      queryClient.setQueryData(["profile", "me"], data);
    },
  });
};

export const useRemoveAvatar = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => profileApi.removeAvatar(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", "me"] });
    },
  });
};

export const useGetBlocks = () => {
  return useQuery({
    queryKey: ["profile", "blocks"],
    queryFn: profileApi.getBlocks,
  });
};

export const useBlockUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => profileApi.blockUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", "blocks"] });
    },
  });
};

export const useUnblockUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => profileApi.unblockUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", "blocks"] });
    },
  });
};
