import { z } from "zod";

export const createDirectConversationSchema = z.object({
  participantId: z.string().uuid(),
});

export const createGroupConversationSchema = z.object({
  name: z.string().min(1),
  participantIds: z.array(z.string().uuid()).min(1),
  avatarMediaId: z.string().uuid().nullable().optional(),
});

export const updateGroupConversationSchema = z.object({
  name: z.string().min(1).optional(),
  avatarMediaId: z.string().uuid().nullable().optional(),
});

export const setGroupAvatarSchema = z.object({
  mediaId: z.string().uuid(),
});

export const addGroupMembersSchema = z.object({
  participantIds: z.array(z.string().uuid()).min(1),
});

export const updateGroupMemberRoleSchema = z.object({
  role: z.enum(["admin", "member"]),
});

export const transferGroupOwnershipSchema = z.object({
  newOwnerId: z.string().uuid(),
});

export const updateConversationSettingsSchema = z.object({
  archived: z.boolean().optional(),
  muted: z.boolean().optional(),
  pinned: z.boolean().optional(),
});

export const muteConversationSchema = z.object({
  duration: z.enum(["8_hours", "24_hours", "7_days", "always"]),
});
