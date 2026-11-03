import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { conversationApi } from "../api/conversation.api";
import type {
  AddGroupMembersDto,
  Conversation,
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
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateDirectConversationDto) =>
      conversationApi.createDirect(payload),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["conversations", "list"] }),
  });
};

export const useCreateGroupConversation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateGroupConversationDto) =>
      conversationApi.createGroup(payload),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["conversations", "list"] }),
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

export const useClearGroupAvatar = () => {
  return useMutation({
    mutationFn: (conversationId: string) =>
      conversationApi.clearGroupAvatar(conversationId),
  });
};

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

export const useDeleteForMe = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (conversationId: string) =>
      conversationApi.deleteForMe(conversationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
};

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

function useConversationAction<TVars>(
  mutationFn: (vars: TVars) => Promise<unknown>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["conversations"] }),
  });
}

export const useArchiveConversation = () =>
  useConversationAction((id: string) => conversationApi.archive(id));

export const useUnarchiveConversation = () =>
  useConversationAction((id: string) => conversationApi.unarchive(id));

export const useFavoriteConversation = () =>
  useConversationAction((id: string) => conversationApi.favorite(id));

export const useUnfavoriteConversation = () =>
  useConversationAction((id: string) => conversationApi.unfavorite(id));

type ConversationSettings = Conversation["settings"];

function patchConversation(
  old: unknown,
  id: string,
  patch: Partial<ConversationSettings>,
): unknown {
  if (!old || typeof old !== "object") return old;

  const patchOne = (c: Conversation): Conversation =>
    c.id === id ? { ...c, settings: { ...c.settings, ...patch } } : c;

  if (Array.isArray(old)) return old.map(patchOne);
  if ("items" in old && Array.isArray(old.items)) {
    return { ...old, items: old.items.map(patchOne) };
  }
  if ("id" in old && old.id === id) return patchOne(old as Conversation);
  return old;
}

function useOptimisticSetting<TVars>(
  mutationFn: (vars: TVars) => Promise<unknown>,
  getId: (vars: TVars) => string,
  patch: Partial<ConversationSettings>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onMutate: async (vars: TVars) => {
      await queryClient.cancelQueries({ queryKey: ["conversations"] });
      const previous = queryClient.getQueriesData({
        queryKey: ["conversations"],
      });

      queryClient.setQueriesData({ queryKey: ["conversations"] }, (old) =>
        patchConversation(old, getId(vars), patch),
      );

      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      ctx?.previous.forEach(([key, data]) =>
        queryClient.setQueryData(key, data),
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
}

export const usePinConversation = () =>
  useOptimisticSetting(
    (id: string) => conversationApi.pin(id),
    (id) => id,
    { pinned: true },
  );

export const useUnpinConversation = () =>
  useOptimisticSetting(
    (id: string) => conversationApi.unpin(id),
    (id) => id,
    { pinned: false },
  );

type MuteVars = { conversationId: string; payload: MuteConversationDto };

export const useMuteConversation = () =>
  useOptimisticSetting(
    ({ conversationId, payload }: MuteVars) =>
      conversationApi.mute(conversationId, payload),
    (v) => v.conversationId,
    { muted: true },
  );

export const useUnmuteConversation = () =>
  useOptimisticSetting(
    (id: string) => conversationApi.unmute(id),
    (id) => id,
    { muted: false },
  );

export const useClearConversationMessages = () => {
  return useMutation({
    mutationFn: (conversationId: string) =>
      conversationApi.clearMessages(conversationId),
  });
};

export const useInvalidateConversations = () => {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ["conversations"] });
};
