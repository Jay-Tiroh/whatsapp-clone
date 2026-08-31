import { useChatsStore } from "@/features/chats/store/chatsStore";
import ThemedText from "@/shared/components/ThemedText";
import { formatTime } from "@/shared/utils/date";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { useRouter } from "expo-router";
import { Pressable, View } from "react-native";
import { withUniwind } from "uniwind";
import type { Conversation } from "../types/conversation.types";

const StyledFontAwesome6 = withUniwind(FontAwesome6);

interface ArchivedButtonProps {
  conversations: Conversation[];
}

export default function ArchivedButton({ conversations }: ArchivedButtonProps) {
  const router = useRouter();
  const archivedChatIds = useChatsStore((s) => s.archivedChatIds);

  const archivedConversations = conversations
    .filter((c) => archivedChatIds.includes(c.id))
    .sort(
      (a, b) =>
        new Date(b.lastActivityAt).getTime() -
        new Date(a.lastActivityAt).getTime(),
    );
  console.log("Archived Conversations:", archivedConversations);
  console.log("Conversations:", conversations);
  console.log("Archived ChatIds:", archivedChatIds);

  if (archivedConversations.length === 0) return null;

  const mostRecent = archivedConversations[0];
  const totalUnread = archivedConversations.reduce(
    (sum, c) => sum + c.unreadCount,
    0,
  );
  const hasUnread = totalUnread > 0;
  const previewNames = archivedConversations
    .slice(0, 2)
    .map((c) => c.otherParticipant.displayName ?? "Unknown")
    .join(", ");

  return (
    <Pressable
      onPress={() => router.push("/(tabs)/chats/archived")}
      className="w-full px-safe-offset-6 gap-4 flex-row items-center rounded-xl h-20 active:bg-primary-50 active:dark:bg-neutral-700 bg-background"
    >
      <View className="w-fit size-14 rounded-full bg-primary-400 true-center">
        <StyledFontAwesome6
          name="box-archive"
          size={24}
          className="text-white/90"
        />
      </View>
      <View className="gap-1 flex-1">
        <View className="flex-row justify-between gap-2">
          <View className="flex-row gap-2 items-center">
            <ThemedText type="bodyXl" weight="bold">
              Archived Chats
            </ThemedText>
          </View>
          <ThemedText
            type="bodyMd"
            className={hasUnread ? "text-primary-400" : "text-neutral-300"}
          >
            {formatTime(mostRecent.lastActivityAt)}
          </ThemedText>
        </View>
        <View className="flex-row gap-2 items-center">
          <View className="flex-row flex-1 gap-1 items-center">
            <ThemedText
              type="bodyLg"
              color="muted"
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {previewNames}
            </ThemedText>
          </View>
          {hasUnread && (
            <View className="size-6 rounded-full items-center justify-center bg-primary-400">
              <ThemedText weight="bold" className="text-white/90">
                {totalUnread}
              </ThemedText>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
}
