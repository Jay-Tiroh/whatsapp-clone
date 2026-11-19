import { useAccountId } from "@/core/lib/queryKeys";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { profileApi } from "../api/profile.api";
import type {
  RegisterPushDeviceDto,
  SetProfileAvatarDto,
  UpdateProfileDto,
} from "../types/user.types";

export const useGetProfile = () => {
  const accountId = useAccountId();
  return useQuery({
    queryKey: ["profile", "me", accountId],
    queryFn: profileApi.getMe,
    staleTime: 1000 * 60 * 2,
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const accountId = useAccountId();
  return useMutation({
    mutationFn: (payload: UpdateProfileDto) =>
      profileApi.updateProfile(payload),
    onSuccess: (data) => {
      queryClient.setQueryData(["profile", "me", accountId], data);
    },
  });
};

export const useSetAvatar = () => {
  const queryClient = useQueryClient();
  const accountId = useAccountId();
  return useMutation({
    mutationFn: (payload: SetProfileAvatarDto) => profileApi.setAvatar(payload),
    onSuccess: (data) => {
      queryClient.setQueryData(["profile", "me", accountId], data);
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
  const accountId = useAccountId();
  return useQuery({
    queryKey: ["profile", "blocks", accountId],
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

export const useRegisterPushDevice = () => {
  return useMutation({
    mutationFn: ({
      installationId,
      payload,
    }: {
      installationId: string;
      payload: RegisterPushDeviceDto;
    }) => profileApi.registerPushDevice(installationId, payload),
  });
};

export const useUnregisterPushDevice = () => {
  return useMutation({
    mutationFn: (installationId: string) =>
      profileApi.unregisterPushDevice(installationId),
  });
};
