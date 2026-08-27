import ChatItem from "@/features/chats/components/ChatItem";
import SubListHeader from "@/features/chats/components/SubListHeader";
import { mockConversationListResponse } from "@/features/chats/mocks/conversation.mocks";
import ThemedText from "@/shared/components/ThemedText";
import { useState } from "react";
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
  const isEmpty = !isLoading && (data?.items.length ?? 0) === 0;

  const [selectedConversations, setSelectedConversations] = useState<string[]>(
    [],
  );
  const isSelecting = selectedConversations.length > 0;
  const handleCancelSelection = () => setSelectedConversations([]);

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
        data={data?.items ?? []}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ChatItem
            conversation={item} // Assuming mock maps to domain model in real implementation
            setSelectedConversations={setSelectedConversations}
            isSelecting={isSelecting}
            selectedConversations={selectedConversations}
          />
        )}
        contentContainerClassName="gap-1"
        showsVerticalScrollIndicator={false}
        onRefresh={refetch}
        refreshing={isRefetching}
      />
    );
  };

  return (
    <View className="flex-1 items-center bg-background">
      <SubListHeader
        selectionMode={isSelecting}
        selectedCount={selectedConversations.length}
        onCancelSelection={handleCancelSelection}
        title="Archived Chats"
      />
      <View className="flex-1 w-full">{renderContent()}</View>
    </View>
  );
}
