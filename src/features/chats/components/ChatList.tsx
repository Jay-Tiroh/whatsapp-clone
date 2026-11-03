import ArchivedButton from "@/features/chats/components/ArchivedButton";
import ChatItem from "@/features/chats/components/ChatItem";
import { usePullToRefresh } from "@/shared/hooks/usePullToRefresh";
import { useCallback } from "react";
import { FlatList, RefreshControl, View } from "react-native";
import type { Conversation } from "../types/conversation.types";

interface ChatListProps {
  conversations: Conversation[];
  onRefresh: () => void | Promise<any>;
  isSelecting: boolean;
  selectedConversations: string[];
  setSelectedConversations: React.Dispatch<React.SetStateAction<string[]>>;
  currentUserId?: string;
  pinnedCount: number;
}

export default function ChatList({
  conversations,
  onRefresh,
  isSelecting,
  selectedConversations,
  setSelectedConversations,
  currentUserId,
  pinnedCount,
}: ChatListProps) {
  // Only true for user-initiated pulls
  const { isPulling, handleRefresh } = usePullToRefresh(onRefresh);
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
        ListHeaderComponent={<ArchivedButton />}
        contentContainerClassName="gap-1"
        showsVerticalScrollIndicator={false}
        extraData={selectedConversations}
        refreshControl={
          <RefreshControl
            refreshing={isPulling}
            onRefresh={handleRefresh}
            enabled={!isSelecting}
            tintColor="#25D366"
            colors={["#25D366"]}
            progressBackgroundColor="#ffffff"
          />
        }
      />
    </View>
  );
}
