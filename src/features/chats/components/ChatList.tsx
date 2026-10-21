import ArchivedButton from "@/features/chats/components/ArchivedButton";
import ChatItem from "@/features/chats/components/ChatItem";
import { useCallback } from "react";
import { FlatList, View } from "react-native";
import type { Conversation } from "../types/conversation.types";

interface ChatListProps {
  conversations: Conversation[];
  // Updated to accept React Query's refetch function signature
  onRefresh: () => void | Promise<any>;
  isRefetching: boolean;
  isSelecting: boolean;
  selectedConversations: string[];
  setSelectedConversations: React.Dispatch<React.SetStateAction<string[]>>;
  currentUserId?: string;
  pinnedCount: number;
}

export default function ChatList({
  conversations,
  onRefresh,
  isRefetching,
  isSelecting,
  selectedConversations,
  setSelectedConversations,
  currentUserId,
  pinnedCount,
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
        currentUserId={currentUserId}
        isSelecting={isSelecting}
        isSelected={selectedConversations.includes(item.id)}
        onToggleSelect={handleToggleSelect}
        pinnedCount={pinnedCount}
      />
    ),
    [
      currentUserId,
      isSelecting,
      selectedConversations,
      handleToggleSelect,
      pinnedCount,
    ],
  );

  return (
    <View className="flex-1 w-full">
      <FlatList
        data={conversations}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        // No longer passing inline function or props here
        ListHeaderComponent={<ArchivedButton />}
        contentContainerClassName="gap-1"
        showsVerticalScrollIndicator={false}
        onRefresh={onRefresh}
        refreshing={isRefetching}
        extraData={selectedConversations}
      />
    </View>
  );
}
