import Bg from "@/assets/images/bg.svg";
import { useConversationScreenLogic } from "@/features/conversation/hooks/useConversationScreenLogic";
import ChatLayoutWrapper from "@/shared/components/ChatLayoutWrapper";
import { useLocalSearchParams } from "expo-router";
import { StyleSheet, View } from "react-native";
import { withUniwind } from "uniwind";

import ChatHeader from "../components/ChatHeader";
import MessageInputBar from "../components/MessageInputBar";
import MessageList from "../components/MessageList";

const StyledBg = withUniwind(Bg);

export default function ConversationScreen() {
  const { conversationId } = useLocalSearchParams<{
    conversationId: string;
  }>();

  const {
    conversation,
    messages,
    otherUserReceipt,
    handleSend,
    startTyping,
    stopTyping,
    refreshing,
    onRefresh,
    onLoadMore,
  } = useConversationScreenLogic(conversationId);

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
        bottomInput={
          <MessageInputBar
            onSend={handleSend}
            onTypingStart={startTyping}
            onTypingStop={stopTyping}
          />
        }
      >
        <View
          className="flex-1 items-center relative"
          style={StyleSheet.absoluteFill}
        >
          <ChatHeader conversation={conversation} />

          <View className="flex-1 w-full bg-transparent px-safe-offset-5 pb-5">
            <MessageList
              conversationId={conversationId}
              messages={messages}
              otherUserReceipt={otherUserReceipt}
              refreshing={refreshing}
              onRefresh={onRefresh}
              onEndReached={onLoadMore}
            />
          </View>
        </View>
      </ChatLayoutWrapper>
    </View>
  );
}
