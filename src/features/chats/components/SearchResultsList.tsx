// components/SearchResultsList.tsx
import { useCreateDirectConversation } from "@/features/chats/hooks/useConversations";
import ThemedText from "@/shared/components/ThemedText";
import { showErrorToast, showSuccessToast } from "@/shared/hooks/showToast";
import { getErrorMessage } from "@/shared/utils/errors";
import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  View,
} from "react-native";
import type { DiscoveredUser } from "../../contacts/types/discovery.types";

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
  const router = useRouter();
  const createDM = useCreateDirectConversation();
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
      renderItem={({ item }) => {
        const handlePress = () => {
          createDM.mutate(
            { participantId: item.id },
            {
              onSuccess: (response) =>
                showSuccessToast({ title: "Conversation Created" }),
              onError: (error) =>
                showErrorToast({
                  title: "Couldn't send code",
                  message:
                    getErrorMessage(error) ??
                    "Check your number and try again.",
                }),
            },
          );
          onPressUser ? onPressUser : null;
        };
        return (
          <Pressable
            className="flex-row items-center gap-3 px-6 py-3 active:opacity-70"
            onPress={handlePress}
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
        );
      }}
    />
  );
}
