// components/MessageBubble.tsx
import ThemedText from "@/shared/components/ThemedText";
import { View } from "react-native";

export type Message = {
  id: string;
  text: string;
  sentByMe: boolean;
};

export default function MessageBubble({ item }: { item: Message }) {
  return (
    <View
      className={`px-4 py-2 my-1 rounded-2xl max-w-[75%] ${
        item.sentByMe
          ? "self-end bg-primary-400"
          : "self-start bg-white dark:bg-neutral-800"
      }`}
    >
      <ThemedText className={item.sentByMe ? "text-white" : ""}>
        {item.text}
      </ThemedText>
    </View>
  );
}
