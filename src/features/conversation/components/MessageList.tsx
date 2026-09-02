// components/MessageList.tsx
import ThemedText from "@/shared/components/ThemedText";
import { FlashList } from "@shopify/flash-list";
import MessageBubble, { Message } from "./MessageBubble";

type Props = {
  conversationId: string | string[];
  messages: Message[];
};

export default function MessageList({ conversationId, messages }: Props) {
  if (messages.length === 0) {
    return <ThemedText>ConversationScreen for {conversationId}</ThemedText>;
  }

  return (
    <FlashList
      data={messages}
      keyExtractor={(item) => item.id}
      maintainVisibleContentPosition={{
        startRenderingFromBottom: true,
        autoscrollToBottomThreshold: 0.2,
      }}
      renderItem={({ item }) => <MessageBubble item={item} />}
    />
  );
}
