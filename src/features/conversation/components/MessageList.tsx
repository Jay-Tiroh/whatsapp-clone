import { useAuthStore } from "@/features/auth";
import { Conversation } from "@/features/chats/types/conversation.types";
import type {
  Message,
  ReceiptPayload,
} from "@/features/conversation/types/message.types";
import ThemedText from "@/shared/components/ThemedText";
import { FlashList } from "@shopify/flash-list";
import { getMessageStatus } from "../utils/messageStatus";
import MessageBubble from "./MessageBubble";

type Props = {
  conversationId: string;
  messages: Message[];
  otherUserReceipt: ReceiptPayload | null;
  refreshing?: boolean;
  onRefresh?: () => void;
  onEndReached?: () => void;
  isGroupConversation?: boolean;
  conversation: Conversation;
};

export default function MessageList({
  messages,
  otherUserReceipt,
  refreshing,
  onRefresh,
  onEndReached,
  isGroupConversation,
  conversation,
}: Props) {
  const myId = useAuthStore((state) => state.user?.id);

  const participants =
    conversation?.type === "group" ? conversation?.participants : [];

  if (messages.length === 0) {
    return (
      <ThemedText className="text-center text-neutral-500">
        No messages yet
      </ThemedText>
    );
  }
  if (!conversation) {
    return (
      <ThemedText className="text-center text-neutral-500">
        Loading...
      </ThemedText>
    );
  }

  return (
    <FlashList
      showsVerticalScrollIndicator={false}
      data={messages}
      keyExtractor={(item) => item.id}
      maintainVisibleContentPosition={{
        startRenderingFromBottom: true,
        autoscrollToBottomThreshold: 0.2,
      }}
      refreshing={refreshing}
      onRefresh={onRefresh}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.3}
      renderItem={({ item }) => (
        <MessageBubble
          item={item}
          status={
            item.senderId === myId
              ? getMessageStatus(item, otherUserReceipt)
              : undefined
          }
          isGroupConversation={isGroupConversation}
          participants={participants}
        />
      )}
    />
  );
}
