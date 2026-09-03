import { useAuthStore } from "@/features/auth";
import type { ReceiptPayload } from "@/features/conversation/screens/ConversationScreen";
import type { Message } from "@/features/conversation/types/message.types";
import ThemedText from "@/shared/components/ThemedText";
import { FlashList } from "@shopify/flash-list";
import { getMessageStatus } from "../utils/messageStatus";
import MessageBubble from "./MessageBubble";

type Props = {
  conversationId: string;
  messages: Message[];
  otherUserReceipt: ReceiptPayload | null;
};

export default function MessageList({ messages, otherUserReceipt }: Props) {
  const myId = useAuthStore((state) => state.user?.id);

  if (messages.length === 0) {
    return (
      <ThemedText className="text-center text-neutral-500">
        No messages yet
      </ThemedText>
    );
  }

  return (
    <FlashList
      data={messages}
      keyExtractor={(item) => item.id}
      maintainVisibleContentPosition={{
        startRenderingFromBottom: true,
        autoscrollToBottomThreshold: 0.2,
      }}
      renderItem={({ item }) => (
        <MessageBubble
          item={item}
          status={
            item.senderId === myId
              ? getMessageStatus(item, otherUserReceipt)
              : undefined
          }
        />
      )}
    />
  );
}
