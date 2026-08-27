import ArchivedButton from "@/features/chats/components/ArchivedButton";
import ChatItem from "@/features/chats/components/ChatItem";
import { FlatList, View } from "react-native";
import type { Conversation } from "../types/conversation.types";

interface ChatListProps {
  conversations: Conversation[];
  onRefresh: () => void;
  isRefetching: boolean;
  isSelecting: boolean;
  selectedConversations: string[];
  setSelectedConversations: React.Dispatch<React.SetStateAction<string[]>>;
}

export default function ChatList({
  conversations,
  onRefresh,
  isRefetching,
  isSelecting,
  selectedConversations,
  setSelectedConversations,
}: ChatListProps) {
  return (
    <View className="flex-1 w-full">
      <ArchivedButton />
      <FlatList
        data={conversations}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ChatItem
            conversation={item}
            setSelectedConversations={setSelectedConversations}
            isSelecting={isSelecting}
            selectedConversations={selectedConversations}
          />
        )}
        contentContainerClassName="gap-1"
        showsVerticalScrollIndicator={false}
        onRefresh={onRefresh}
        refreshing={isRefetching}
      />
    </View>
  );
}
