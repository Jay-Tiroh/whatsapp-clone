import { useSearchMessages } from "@/features/conversation/hooks/useMessage";
import type { Message } from "@/features/conversation/types/message.types";
import {
  MESSAGE_SEARCH_MAX_LENGTH,
  MESSAGE_SEARCH_MIN_LENGTH,
  normalizeMessageSearchQuery,
} from "@/features/conversation/validation/message.validation";
import SearchBar from "@/shared/components/Searchbar";
import ThemedText from "@/shared/components/ThemedText";
import { formatTime } from "@/shared/utils/date";
import { getErrorMessage } from "@/shared/utils/errors";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Href, useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, View } from "react-native";
import { withUniwind } from "uniwind";

const StyledIonicons = withUniwind(Ionicons);

const ATTACHMENT_LABEL: Record<Message["kind"], string> = {
  text: "Message",
  image: "Photo",
  audio: "Voice message",
  video: "Video",
  document: "Document",
};

function formatResultTimestamp(iso: string) {
  const date = new Date(iso);
  const isToday = date.toDateString() === new Date().toDateString();

  return isToday
    ? formatTime(iso)
    : date.toLocaleDateString([], { day: "numeric", month: "short" });
}

function SearchResultRow({
  message,
  onPress,
}: {
  message: Message;
  onPress: () => void;
}) {
  const preview = message.text?.trim() || ATTACHMENT_LABEL[message.kind];

  return (
    <Pressable
      className="px-6 py-3 active:opacity-70"
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Open conversation at message: ${preview}`}
    >
      <View className="flex-row items-center justify-between gap-3">
        <ThemedText type="bodyLg" numberOfLines={1} className="flex-1">
          {preview}
        </ThemedText>
        <ThemedText type="bodySm" color="muted">
          {formatResultTimestamp(message.createdAt)}
        </ThemedText>
      </View>
    </Pressable>
  );
}

export default function MessageSearchScreen() {
  const { conversationId } = useLocalSearchParams<{
    conversationId: string;
  }>();
  const router = useRouter();
  const [input, setInput] = useState("");

  const {
    data,
    error,
    isError,
    isFetching,
    isDebouncing,
    searchQuery,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    refetch,
  } = useSearchMessages(conversationId, input);

  const results = useMemo(
    () => data?.pages.flatMap((page) => page.items) ?? [],
    [data],
  );

  const normalizedInput = normalizeMessageSearchQuery(input);
  const isTooShort =
    normalizedInput.length > 0 &&
    normalizedInput.length < MESSAGE_SEARCH_MIN_LENGTH;

  const openConversation = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.push(`/chats/${conversationId}` as Href);
  };

  const renderContent = () => {
    if (normalizedInput.length === 0) {
      return (
        <View className="flex-1 items-center justify-center px-6">
          <ThemedText color="muted" className="text-center">
            Search this conversation's messages.
          </ThemedText>
        </View>
      );
    }

    if (isTooShort) {
      return (
        <View className="flex-1 items-center justify-center px-6">
          <ThemedText color="muted" type="bodySm" className="text-center">
            Type at least {MESSAGE_SEARCH_MIN_LENGTH} characters to search.
          </ThemedText>
        </View>
      );
    }

    if (isError) {
      return (
        <View className="flex-1 items-center justify-center px-6 gap-3">
          <ThemedText className="text-center" color="danger">
            Couldn't search messages.
          </ThemedText>
          <ThemedText color="muted" type="bodySm" className="text-center">
            {getErrorMessage(error)}
          </ThemedText>
          <Pressable
            className="mt-2 rounded-xl bg-primary-400 px-6 py-2 active:opacity-70"
            onPress={() => refetch()}
            accessibilityRole="button"
          >
            <ThemedText type="buttonSm" className="text-white">
              Try again
            </ThemedText>
          </Pressable>
        </View>
      );
    }

    if ((isDebouncing || isFetching) && results.length === 0) {
      return <ActivityIndicator className="mt-8" size="large" />;
    }

    if (results.length === 0) {
      return (
        <View className="flex-1 items-center justify-center px-6">
          <ThemedText color="muted" className="text-center">
            No messages found for “{searchQuery}”.
          </ThemedText>
        </View>
      );
    }

    return (
      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <SearchResultRow message={item} onPress={openConversation} />
        )}
        contentContainerClassName="py-2"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        onEndReached={hasNextPage ? () => fetchNextPage() : undefined}
        onEndReachedThreshold={0.4}
        ListFooterComponent={
          isFetchingNextPage ? (
            <ActivityIndicator className="my-4" />
          ) : undefined
        }
      />
    );
  };

  return (
    <View className="flex-1 bg-background">
      <View className="w-full bg-primary-400 dark:bg-neutral-700 p-safe-offset-6 pb-6">
        <View className="flex-row items-center gap-3">
          <Pressable
            className="active:opacity-70"
            onPress={openConversation}
            accessibilityRole="button"
            accessibilityLabel="Back to conversation"
          >
            <StyledIonicons
              name="chevron-back"
              size={24}
              className="text-white/90"
            />
          </Pressable>
          <View className="flex-1">
            <SearchBar
              autoFocus
              placeholder="Search messages"
              returnKeyType="search"
              value={input}
              onChangeText={setInput}
              maxLength={MESSAGE_SEARCH_MAX_LENGTH}
            />
          </View>
        </View>
      </View>

      <View className="flex-1 w-full">{renderContent()}</View>
    </View>
  );
}
