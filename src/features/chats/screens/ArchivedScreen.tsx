import { useAuthStore } from "@/features/auth";
import ChatItem from "@/features/chats/components/ChatItem";
import SubListHeader from "@/features/chats/components/SubListHeader";
import {
  useGetArchivedConversations,
  useInvalidateConversations,
  useMuteConversation,
  useUnarchiveConversation,
  useUnmuteConversation,
} from "@/features/chats/hooks/useConversations";
import type { Conversation } from "@/features/chats/types/conversation.types";
import ThemedText from "@/shared/components/ThemedText";
import { showWarningToast } from "@/shared/hooks/showToast";
import { getErrorMessage } from "@/shared/utils/errors";
import { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, View } from "react-native";

export default function ArchivedScreen() {
  const { data, isLoading, isError, refetch, isRefetching } =
    useGetArchivedConversations({ limit: 20 });
  const currentUserId = useAuthStore((s) => s.user?.id);

  const conversations = useMemo(() => data?.items ?? [], [data?.items]);
  const isEmpty = !isLoading && conversations.length === 0;

  const { mutate: muteConversation } = useMuteConversation();
  const { mutate: unmuteConversation } = useUnmuteConversation();
  const { mutateAsync: unarchiveAsync } = useUnarchiveConversation();
  const invalidateConversations = useInvalidateConversations();

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

  const selectedItems = conversations.filter((c) =>
    selectedConversations.includes(c.id),
  );
  const isAllSelectedMuted =
    selectedItems.length > 0 && selectedItems.every((c) => c.settings.muted);

  const onBulkError = (title: string) => (err: unknown) =>
    showWarningToast({
      title,
      message: getErrorMessage(err) ?? "Please try again.",
    });

  // Bulk handlers
  const handleBulkMute = () => {
    if (isAllSelectedMuted) {
      selectedItems.forEach((c) =>
        unmuteConversation(c.id, { onError: onBulkError("Couldn't unmute") }),
      );
    } else {
      selectedItems
        .filter((c) => !c.settings.muted)
        .forEach((c) =>
          muteConversation(
            { conversationId: c.id, payload: { duration: "always" } },
            { onError: onBulkError("Couldn't mute") },
          ),
        );
    }
    endSelection();
  };

  const handleBulkUnarchive = async () => {
    const ids = selectedItems.map((c) => c.id);
    endSelection();

    const results = await Promise.allSettled(
      ids.map((id) => unarchiveAsync(id)),
    );
    const failed = results.find((r) => r.status === "rejected");
    if (failed && failed.status === "rejected") {
      onBulkError("Couldn't unarchive some chats")(failed.reason);
    }
    invalidateConversations(); // one refetch after all requests settle
  };

  const handleBulkDelete = () => {
    endSelection();
  };

  const renderItem = useCallback(
    ({ item }: { item: Conversation }) => (
      <ChatItem
        conversation={item}
        currentUserId={currentUserId}
        isSelecting={isSelecting}
        isSelected={selectedConversations.includes(item.id)}
        onToggleSelect={handleToggleSelect}
        isArchived
      />
    ),
    [currentUserId, isSelecting, selectedConversations, handleToggleSelect],
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
        data={conversations}
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
