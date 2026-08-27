// features/conversations/mocks/conversation.mocks.ts
import type {
  ConversationListResponseDto,
  ConversationResponseDto,
} from "../types/conversation.types";

export const mockConversations: ConversationResponseDto[] = [
  {
    id: "conv_1",
    type: "direct",
    otherParticipant: {
      id: "user_1",
      displayName: "Darrell Steward",
      avatarUrl: null,
    },
    latestMessage: {
      id: "msg_1",
      senderId: "user_1",
      kind: "text",
      preview: "Hello, good morning! ✨",
      createdAt: "2026-08-26T05:47:00.000Z",
    },
    unreadCount: 4,
    lastActivityAt: "2026-08-26T05:47:00.000Z",
    createdAt: "2026-08-01T10:00:00.000Z",
    updatedAt: "2026-08-26T05:47:00.000Z",
  },
  {
    id: "conv_2",
    type: "direct",
    otherParticipant: {
      id: "user_2",
      displayName: "Cody Fisher",
      avatarUrl: "https://i.pravatar.cc/150?u=user_2",
    },
    latestMessage: {
      id: "msg_2",
      senderId: "current_user",
      kind: "text",
      preview: "Sure, I'll send it over shortly",
      createdAt: "2026-08-26T03:15:00.000Z",
    },
    unreadCount: 0,
    lastActivityAt: "2026-08-26T03:15:00.000Z",
    createdAt: "2026-07-20T09:00:00.000Z",
    updatedAt: "2026-08-26T03:15:00.000Z",
  },
  {
    id: "conv_3",
    type: "direct",
    otherParticipant: {
      id: "user_3",
      displayName: "Sir Albert",
      avatarUrl: null,
    },
    latestMessage: null,
    unreadCount: 0,
    lastActivityAt: "2026-08-20T14:00:00.000Z",
    createdAt: "2026-08-20T14:00:00.000Z",
    updatedAt: "2026-08-20T14:00:00.000Z",
  },
  {
    id: "conv_4",
    type: "direct",
    otherParticipant: {
      id: "user_4",
      displayName: "Jane Cooper",
      avatarUrl: "https://i.pravatar.cc/150?u=user_4",
    },
    latestMessage: {
      id: "msg_4",
      senderId: "user_4",
      kind: "text",
      preview: "See you tomorrow then 👋",
      createdAt: "2026-08-25T18:30:00.000Z",
    },
    unreadCount: 1,
    lastActivityAt: "2026-08-25T18:30:00.000Z",
    createdAt: "2026-06-11T08:00:00.000Z",
    updatedAt: "2026-08-25T18:30:00.000Z",
  },
];

export const mockConversationListResponse: ConversationListResponseDto = {
  items: mockConversations,
  pageInfo: {
    nextCursor: null,
    hasNextPage: false,
  },
};
