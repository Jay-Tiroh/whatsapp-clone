import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { conversationApi } from "../api/conversation.api";
import type {
  AddGroupMembersDto,
  CreateDirectConversationDto,
  CreateGroupConversationDto,
  MuteConversationDto,
  SetGroupAvatarDto,
  TransferGroupOwnershipDto,
  UpdateConversationSettingsDto,
  UpdateGroupConversationDto,
  UpdateGroupMemberRoleDto,
} from "../types/conversation.types";

export const useCreateDirectConversation = () => {
  return useMutation({
    mutationFn: (payload: CreateDirectConversationDto) =>
      conversationApi.createDirect(payload),
  });
};

// NEW
export const useCreateGroupConversation = () => {
  return useMutation({
    mutationFn: (payload: CreateGroupConversationDto) =>
      conversationApi.createGroup(payload),
  });
};

export const useGetConversations = (params?: {
  limit?: number;
  cursor?: string;
  archived?: boolean;
}) => {
  return useQuery({
    queryKey: ["conversations", "list", params],
    queryFn: () => conversationApi.getList(params),
    staleTime: 1000 * 10,
  });
};

// NEW
export const useGetArchivedConversations = (params?: {
  limit?: number;
  cursor?: string;
}) => {
  return useQuery({
    queryKey: ["conversations", "archived", params],
    queryFn: () => conversationApi.getListArchived(params),
    staleTime: 1000 * 10,
  });
};

// NEW
export const useGetFavoriteConversations = (params?: {
  limit?: number;
  cursor?: string;
  archived?: boolean;
}) => {
  return useQuery({
    queryKey: ["conversations", "favorites", params],
    queryFn: () => conversationApi.getListFavorites(params),
    staleTime: 1000 * 10,
  });
};

export const useGetConversationById = (conversationId: string) => {
  return useQuery({
    queryKey: ["conversations", "detail", conversationId],
    queryFn: () => conversationApi.getById(conversationId),
    enabled: !!conversationId,
  });
};

// NEW
export const useDeleteGroupConversation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (conversationId: string) =>
      conversationApi.deleteGroup(conversationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
};

// NEW
export const useUpdateGroupConversation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      conversationId,
      payload,
    }: {
      conversationId: string;
      payload: UpdateGroupConversationDto;
    }) => conversationApi.updateGroup(conversationId, payload),
    onSuccess: (data) => {
      queryClient.setQueryData(["conversations", "detail", data.id], data);
    },
  });
};

// NEW
export const useSetGroupAvatar = () => {
  return useMutation({
    mutationFn: ({
      conversationId,
      payload,
    }: {
      conversationId: string;
      payload: SetGroupAvatarDto;
    }) => conversationApi.setGroupAvatar(conversationId, payload),
  });
};

// NEW
export const useClearGroupAvatar = () => {
  return useMutation({
    mutationFn: (conversationId: string) =>
      conversationApi.clearGroupAvatar(conversationId),
  });
};

// NEW
export const useAddGroupMembers = () => {
  return useMutation({
    mutationFn: ({
      conversationId,
      payload,
    }: {
      conversationId: string;
      payload: AddGroupMembersDto;
    }) => conversationApi.addGroupMembers(conversationId, payload),
  });
};

// NEW
export const useRemoveGroupMember = () => {
  return useMutation({
    mutationFn: ({
      conversationId,
      memberId,
    }: {
      conversationId: string;
      memberId: string;
    }) => conversationApi.removeGroupMember(conversationId, memberId),
  });
};

// NEW
export const useUpdateGroupMemberRole = () => {
  return useMutation({
    mutationFn: ({
      conversationId,
      memberId,
      payload,
    }: {
      conversationId: string;
      memberId: string;
      payload: UpdateGroupMemberRoleDto;
    }) =>
      conversationApi.updateGroupMemberRole(conversationId, memberId, payload),
  });
};

// NEW
export const useTransferGroupOwnership = () => {
  return useMutation({
    mutationFn: ({
      conversationId,
      payload,
    }: {
      conversationId: string;
      payload: TransferGroupOwnershipDto;
    }) => conversationApi.transferGroupOwnership(conversationId, payload),
  });
};

// NEW
export const useLeaveGroup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (conversationId: string) =>
      conversationApi.leaveGroup(conversationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
};

// NEW
export const useUpdateConversationSettings = () => {
  return useMutation({
    mutationFn: ({
      conversationId,
      payload,
    }: {
      conversationId: string;
      payload: UpdateConversationSettingsDto;
    }) => conversationApi.updateSettings(conversationId, payload),
  });
};

// NEW
export const useArchiveConversation = () => {
  return useMutation({
    mutationFn: (conversationId: string) =>
      conversationApi.archive(conversationId),
  });
};

// NEW
export const useUnarchiveConversation = () => {
  return useMutation({
    mutationFn: (conversationId: string) =>
      conversationApi.unarchive(conversationId),
  });
};

// NEW
export const useMuteConversation = () => {
  return useMutation({
    mutationFn: ({
      conversationId,
      payload,
    }: {
      conversationId: string;
      payload: MuteConversationDto;
    }) => conversationApi.mute(conversationId, payload),
  });
};

// NEW
export const useUnmuteConversation = () => {
  return useMutation({
    mutationFn: (conversationId: string) =>
      conversationApi.unmute(conversationId),
  });
};

// NEW
export const useFavoriteConversation = () => {
  return useMutation({
    mutationFn: (conversationId: string) =>
      conversationApi.favorite(conversationId),
  });
};

// NEW
export const useUnfavoriteConversation = () => {
  return useMutation({
    mutationFn: (conversationId: string) =>
      conversationApi.unfavorite(conversationId),
  });
};

// NEW
export const usePinConversation = () => {
  return useMutation({
    mutationFn: (conversationId: string) => conversationApi.pin(conversationId),
  });
};

// NEW
export const useUnpinConversation = () => {
  return useMutation({
    mutationFn: (conversationId: string) =>
      conversationApi.unpin(conversationId),
  });
};

// NEW
export const useClearConversationMessages = () => {
  return useMutation({
    mutationFn: (conversationId: string) =>
      conversationApi.clearMessages(conversationId),
  });
};
