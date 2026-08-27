import ArchivedButton from "@/features/chats/components/ArchivedButton";
import ChatItem from "@/features/chats/components/ChatItem";
import ThemedText from "@/shared/components/ThemedText";
import { ActivityIndicator, FlatList, View } from "react-native";
import type { ConversationResponseDto } from "../types/conversation.types";

interface ChatListProps {
  conversations: ConversationResponseDto[];
  isLoading: boolean;
  isError: boolean;
  onRefresh: () => void;
  isRefetching: boolean;
  isSelecting: boolean;
  selectedConversations: string[];
  setSelectedConversations: React.Dispatch<React.SetStateAction<string[]>>;
}

export default function ChatList({
  conversations,
  isLoading,
  isError,
  onRefresh,
  isRefetching,
  isSelecting,
  selectedConversations,
  setSelectedConversations,
}: ChatListProps) {
  return (
    <View className="flex-1 w-full">
      <ArchivedButton />
      {isLoading ? (
        <ActivityIndicator className="mt-8" />
      ) : isError ? (
        <ThemedText className="text-center mt-8">
          Couldn't load chats.
        </ThemedText>
      ) : (
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
          // NOTE: pageInfo.hasNextPage / nextCursor exist on the response but
          // aren't wired up here — swap useGetConversations for
          // useInfiniteQuery + onEndReached when you want "load more".
        />
      )}
    </View>
  );
}
