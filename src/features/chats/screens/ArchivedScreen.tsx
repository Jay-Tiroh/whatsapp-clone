import ChatItem from "@/features/chats/components/ChatItem";
import SubListHeader from "@/features/chats/components/SubListheader";
import { mockConversationListResponse } from "@/features/chats/mocks/conversation.mocks";
import ThemedText from "@/shared/components/ThemedText";
import { useState } from "react";
import { ActivityIndicator, FlatList, View } from "react-native";

export default function ArchivedScreen() {
  const data = mockConversationListResponse;
  const { isLoading, isError, refetch, isRefetching } = {
    isLoading: false,
    isError: false,
    refetch: () => {},
    isRefetching: false,
  };
  const isEmpty = !isLoading && (data?.items.length ?? 0) === 0;

  // --- selection state, lifted from ChatList ---
  const [selectedConversations, setSelectedConversations] = useState<string[]>(
    [],
  );
  const isSelecting = selectedConversations.length > 0;
  const handleCancelSelection = () => setSelectedConversations([]);

  return (
    <>
      <View className="flex-1 items-center bg-background">
        <SubListHeader
          selectionMode={isSelecting}
          selectedCount={selectedConversations.length}
          onCancelSelection={handleCancelSelection}
          title="Archived Chats"
        />
        {isEmpty ? (
          <ThemedText type="h3">No archived conversations</ThemedText>
        ) : (
          <View className="flex-1 w-full">
            {isLoading ? (
              <ActivityIndicator className="mt-8" />
            ) : isError ? (
              <ThemedText className="text-center mt-8">
                Couldn't load chats.
              </ThemedText>
            ) : (
              <FlatList
                data={data?.items ?? []}
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
                onRefresh={refetch}
                refreshing={isRefetching}
              />
            )}
          </View>
        )}
      </View>
    </>
  );
}
