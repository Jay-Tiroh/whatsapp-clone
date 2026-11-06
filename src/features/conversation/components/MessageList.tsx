import { useAuthStore } from "@/features/auth";
import { Conversation } from "@/features/chats/types/conversation.types";
import type {
  DisplayMessage,
  ReceiptPayload,
} from "@/features/conversation/types/message.types";
import ThemedText from "@/shared/components/ThemedText";
import { FlashList } from "@shopify/flash-list";
import { getMessageStatus } from "../utils/messageStatus";
import MessageBubble from "./MessageBubble";

type Props = {
  conversationId: string;
  messages: DisplayMessage[];
  otherUserReceipt: ReceiptPayload | null;
  refreshing?: boolean;
  onRefresh?: () => void;
  onEndReached?: () => void;
  onRetry: (clientMessageId: string) => void;
  isGroupConversation?: boolean;
  conversation: Conversation;
};

export default function MessageList({
  messages,
  otherUserReceipt,
  refreshing,
  onRefresh,
  onEndReached,
  onRetry,
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
      // clientMessageId is the same before and after confirmation, so a bubble
      // doesn't remount when pending turns into sent.
      keyExtractor={(item) => item.clientMessageId || item.id}
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
            item.senderId === myId && !item.delivery
              ? getMessageStatus(item, otherUserReceipt)
              : undefined
          }
          delivery={item.delivery}
          onRetry={() => onRetry(item.clientMessageId)}
          isGroupConversation={isGroupConversation}
          participants={participants}
        />
      )}
    />
  );
}
