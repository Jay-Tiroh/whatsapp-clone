import ChatItem from "@/features/chats/components/ChatItem";
import SubListHeader from "@/features/chats/components/SubListHeader";
import { mockConversationListResponse } from "@/features/chats/mocks/conversation.mocks";
import { useChatsStore } from "@/features/chats/store/chatsStore";
import type { Conversation } from "@/features/chats/types/conversation.types";
import ThemedText from "@/shared/components/ThemedText";
import { useCallback, useState } from "react";
import { ActivityIndicator, FlatList, View } from "react-native";

export default function ArchivedScreen() {
  // TODO: Replace with useGetConversations({ status: 'archived' })
  const data = mockConversationListResponse;
  const { isLoading, isError, refetch, isRefetching } = {
    isLoading: false,
    isError: false,
    refetch: () => {},
    isRefetching: false,
  };

  // Store selections
  const archivedChats = useChatsStore((s) => s.archivedChatIds);
  const pinnedChats = useChatsStore((s) => s.pinnedChatIds);
  const mutedChats = useChatsStore((s) => s.mutedChatIds);

  // Store actions
  const mute = useChatsStore((s) => s.mute);
  const unmute = useChatsStore((s) => s.unmute);
  const unarchive = useChatsStore((s) => s.unarchive);

  const archivedConversations =
    data?.items.filter(
      (c) => archivedChats.includes(c.id) && !pinnedChats.includes(c.id),
    ) ?? [];

  const isEmpty = !isLoading && (data?.items.length ?? 0) === 0;

  // Selection state
  const [selectedConversations, setSelectedConversations] = useState<string[]>(
    [],
  );
  const isSelecting = selectedConversations.length > 0;

  const endSelection = () => setSelectedConversations([]);

  const handleToggleSelect = useCallback((id: string) => {
    setSelectedConversations((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  }, []);

  // Bulk operation boolean derivations
  const conversations = data?.items ?? [];
  const selectedItems = conversations.filter((c) =>
    selectedConversations.includes(c.id),
  );

  const isAllSelectedMuted =
    selectedItems.length > 0 &&
    selectedItems.every((c) => mutedChats.includes(c.id));

  // Bulk operation handlers
  const handleBulkMute = () => {
    selectedConversations.forEach(isAllSelectedMuted ? unmute : mute);
    endSelection();
  };

  const handleBulkUnarchive = () => {
    selectedConversations.forEach(unarchive);
    endSelection();
  };

  const handleBulkDelete = () => {
    // wire to your delete action once confirmed
    endSelection();
  };

  const renderItem = useCallback(
    ({ item }: { item: Conversation }) => (
      <ChatItem
        conversation={item}
        isSelecting={isSelecting}
        isSelected={selectedConversations.includes(item.id)}
        onToggleSelect={handleToggleSelect}
        isArchived
      />
    ),
    [isSelecting, selectedConversations, handleToggleSelect],
  );

  const renderContent = () => {
    if (isLoading) {
      return <ActivityIndicator className="mt-8" size="large" />;
    }
    if (isError) {
      return (
        <ThemedText className="text-center mt-8">
          Couldn't load archived chats.
        </ThemedText>
      );
    }
    if (isEmpty) {
      return (
        <View className="flex-1 items-center justify-center">
          <ThemedText type="h3">No archived conversations</ThemedText>
        </View>
      );
    }
    return (
      <FlatList
        data={archivedConversations ?? []}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerClassName="gap-1"
        showsVerticalScrollIndicator={false}
        onRefresh={refetch}
        refreshing={isRefetching}
        extraData={selectedConversations}
      />
    );
  };

  return (
    <View className="flex-1 items-center bg-background">
      <SubListHeader
        title="Archived Chats"
        selectionMode={isSelecting}
        selectedCount={selectedConversations.length}
        isAllSelectedMuted={isAllSelectedMuted}
        onCancelSelection={endSelection}
        onUnarchive={handleBulkUnarchive}
        onMute={handleBulkMute}
        onDelete={handleBulkDelete}
      />
      <View className="flex-1 w-full">{renderContent()}</View>
    </View>
  );
}
