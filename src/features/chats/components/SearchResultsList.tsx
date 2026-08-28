// components/SearchResultsList.tsx
import ThemedText from "@/shared/components/ThemedText";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  View,
} from "react-native";
import type { DiscoveredUser } from "../types/discovery.types";

interface SearchResultsListProps {
  users: DiscoveredUser[];
  isLoading?: boolean;
  hasNextPage?: boolean;
  onEndReached?: () => void;
  onPressUser?: (user: DiscoveredUser) => void;
}

export default function SearchResultsList({
  users,
  isLoading,
  hasNextPage,
  onEndReached,
  onPressUser,
}: SearchResultsListProps) {
  if (isLoading) {
    return <ActivityIndicator className="mt-8" size="large" />;
  }

  if (users.length === 0) {
    return (
      <ThemedText className="text-center mt-8 text-neutral-400">
        No users found.
      </ThemedText>
    );
  }

  return (
    <FlatList
      data={users}
      keyExtractor={(item) => item.id}
      onEndReached={hasNextPage ? onEndReached : undefined}
      onEndReachedThreshold={0.4}
      renderItem={({ item }) => (
        <Pressable
          className="flex-row items-center gap-3 px-6 py-3 active:opacity-70"
          onPress={() => onPressUser?.(item)}
        >
          {item.avatarUrl ? (
            <Image
              source={{ uri: item.avatarUrl }}
              className="size-11 rounded-full"
            />
          ) : (
            <View className="size-11 rounded-full bg-neutral-300 dark:bg-neutral-600" />
          )}
          <ThemedText type="bodyLg">
            {item.displayName ?? "Unknown user"}
          </ThemedText>
        </Pressable>
      )}
    />
  );
}
