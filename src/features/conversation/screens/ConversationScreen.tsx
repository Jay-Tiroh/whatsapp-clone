// ConversationScreen.tsx
import Bg from "@/assets/images/bg.svg";
import ChatLayoutWrapper from "@/shared/components/ChatLayoutWrapper";
import { logger } from "@/shared/utils/logger";
import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { withUniwind } from "uniwind";
import ChatHeader from "../components/ChatHeader";
import { Message } from "../components/MessageBubble";
import MessageInputBar from "../components/MessageInputBar";
import MessageList from "../components/MessageList";

const StyledBg = withUniwind(Bg);

export default function ConversationScreen() {
  const { conversationId } = useLocalSearchParams();
  logger.log("ConversationScreen params", conversationId);

  const [messages, setMessages] = useState<Message[]>([]);

  const handleSend = (text: string) => {
    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), text, sentByMe: true },
    ]);
  };

  return (
    <View
      className="flex-1 items-center bg-transparent relative w-full"
      style={StyleSheet.absoluteFill}
    >
      <StyledBg
        className="absolute top-0 left-0 right-0 bottom-0 flex-1 w-full h-full dark:text-neutral-700 text-primary-100 bg-primary-50 dark:bg-neutral-900"
        style={StyleSheet.absoluteFill}
        preserveAspectRatio="xMidYMid slice"
      />
      <ChatLayoutWrapper
        bottomInputClassName="bg-transparent"
        bottomInput={<MessageInputBar onSend={handleSend} />}
      >
        <View
          className="flex-1 items-center relative"
          style={StyleSheet.absoluteFill}
        >
          <ChatHeader title="John Doe" />
          <View className="flex-1 w-full bg-transparent">
            <MessageList conversationId={conversationId} messages={messages} />
          </View>
        </View>
      </ChatLayoutWrapper>
    </View>
  );
}
