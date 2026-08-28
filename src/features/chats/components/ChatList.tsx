import ArchivedButton from "@/features/chats/components/ArchivedButton";
import ChatItem from "@/features/chats/components/ChatItem";
import { useCallback } from "react";
import { FlatList, View } from "react-native";
import type { Conversation } from "../types/conversation.types";

interface ChatListProps {
  conversations: Conversation[];
  archived: Conversation[];
  onRefresh: () => void;
  isRefetching: boolean;
  isSelecting: boolean;
  selectedConversations: string[];
  setSelectedConversations: React.Dispatch<React.SetStateAction<string[]>>;
}

export default function ChatList({
  archived,
  conversations,
  onRefresh,
  isRefetching,
  isSelecting,
  selectedConversations,
  setSelectedConversations,
}: ChatListProps) {
  const handleToggleSelect = useCallback(
    (id: string) => {
      setSelectedConversations((prev) =>
        prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
      );
    },
    [setSelectedConversations],
  );

  const renderItem = useCallback(
    ({ item }: { item: Conversation }) => (
      <ChatItem
        conversation={item}
        isSelecting={isSelecting}
        isSelected={selectedConversations.includes(item.id)}
        onToggleSelect={handleToggleSelect}
      />
    ),
    [isSelecting, selectedConversations, handleToggleSelect],
  );

  return (
    <View className="flex-1 w-full">
      <FlatList
        data={conversations}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListHeaderComponent={() => <ArchivedButton conversations={archived} />}
        contentContainerClassName="gap-1"
        showsVerticalScrollIndicator={false}
        onRefresh={onRefresh}
        refreshing={isRefetching}
        extraData={selectedConversations} // Forces re-render when selections change
      />
    </View>
  );
}
