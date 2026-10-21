import { usePinStore } from "@/core/store/pinStore";
import { useAuthStore } from "@/features/auth";
import ChatList from "@/features/chats/components/ChatList";
import ChatListEmpty from "@/features/chats/components/ChatListEmpty";
import CreateNewChatButton from "@/features/chats/components/CreateNewChatBtn";
import MainListHeader from "@/features/chats/components/MainListHeader";
import PinPromptModal from "@/features/chats/components/PinPromptModal";
import SearchResultsList from "@/features/chats/components/SearchResultsList";
import { useConversationListRealtime } from "@/features/chats/hooks/useConversationListRealtime";
import {
  useArchiveConversation,
  useGetConversations,
  useMuteConversation,
  usePinConversation,
  useUnarchiveConversation,
  useUnmuteConversation,
  useUnpinConversation,
} from "@/features/chats/hooks/useConversations";
import { useMatchedContacts, useSearchUsers } from "@/features/contacts";
import ThemedText from "@/shared/components/ThemedText";
import { showWarningToast } from "@/shared/hooks/showToast";
import { useExitOnDoubleBack } from "@/shared/hooks/useExitOnDoubleBack";
import { getErrorMessage } from "@/shared/utils/errors";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { withUniwind } from "uniwind";

const StyledMaterialIcons = withUniwind(MaterialIcons);
const StyledFontAwesome = withUniwind(FontAwesome);
const StyledIonicons = withUniwind(Ionicons);
const StyledFontAwesome6 = withUniwind(FontAwesome6);

const MAX_PINNED = 3;

export default function ChatListScreen() {
  useExitOnDoubleBack("Press back again to exit");
  const queryClient = useQueryClient();

  const [selectedConversations, setSelectedConversations] = useState<string[]>(
    [],
  );
  const isSelecting = selectedConversations.length > 0;
  const endSelection = () => setSelectedConversations([]);

  const { data, isLoading, isError, refetch, isRefetching } =
    useGetConversations({ limit: 20 });
  const currentUserId = useAuthStore((s) => s.user?.id);

  useConversationListRealtime(
    data?.items.map((c) => c.id) ?? [],
    currentUserId,
  );

  const { matches, isLoading: matchesLoading } = useMatchedContacts();

  const isEmpty = !isLoading && (data?.items.length ?? 0) === 0;

  // Search
  const [search, setSearch] = useState("");
  const isSearching = search.trim().length > 0;
  const {
    data: searchData,
    fetchNextPage,
    hasNextPage,
    isFetching: isSearchFetching,
  } = useSearchUsers(search);
  const searchResults = searchData?.pages.flatMap((p) => p.items) ?? [];

  const conversations = data?.items ?? [];

  // Lists splitting
  const { displayConversations, pinnedCount } = useMemo(() => {
    const pinned = conversations
      .filter((c) => c.settings.pinned && !c.settings.archived)
      .sort(
        (a, b) =>
          +new Date(b.settings.pinnedAt ?? 0) -
          +new Date(a.settings.pinnedAt ?? 0),
      );
    const rest = conversations.filter(
      (c) => !c.settings.pinned && !c.settings.archived,
    );
    return {
      displayConversations: [...pinned, ...rest],
      pinnedCount: pinned.length,
    };
  }, [conversations]);

  const { mutate: pinConversation } = usePinConversation();
  const { mutate: unpinConversation } = useUnpinConversation();
  const { mutate: muteConversation } = useMuteConversation();
  const { mutate: unmuteConversation } = useUnmuteConversation();
  const { mutate: archiveConversation } = useArchiveConversation();
  const { mutate: unarchiveConversation } = useUnarchiveConversation();

  const selectedItems = conversations.filter((c) =>
    selectedConversations.includes(c.id),
  );

  const isAllSelectedPinned =
    selectedItems.length > 0 && selectedItems.every((c) => c.settings.pinned);
  const isAllSelectedMuted =
    selectedItems.length > 0 && selectedItems.every((c) => c.settings.muted);
  const isAllSelectedArchived =
    selectedItems.length > 0 && selectedItems.every((c) => c.settings.archived);

  const onBulkError = (title: string) => (err: unknown) =>
    showWarningToast({
      title,
      message: getErrorMessage(err) ?? "Please try again.",
    });

  const handleBulkPin = () => {
    if (isAllSelectedPinned) {
      selectedItems.forEach((c) =>
        unpinConversation(c.id, { onError: onBulkError("Couldn't unpin") }),
      );
    } else {
      const newlyPinning = selectedItems.filter((c) => !c.settings.pinned);
      if (pinnedCount + newlyPinning.length > MAX_PINNED) {
        showWarningToast({
          title: "Pin Limit Reached",
          message: `You can only pin up to ${MAX_PINNED} conversations.`,
        });
        return;
      }
      newlyPinning.forEach((c) =>
        pinConversation(c.id, { onError: onBulkError("Couldn't pin") }),
      );
    }
    endSelection();
  };

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

  const handleBulkArchive = () => {
    if (isAllSelectedArchived) {
      selectedItems.forEach((c) =>
        unarchiveConversation(c.id, {
          onError: onBulkError("Couldn't unarchive"),
          onSuccess: () =>
            queryClient.invalidateQueries({ queryKey: ["conversations"] }),
        }),
      );
    } else {
      if (selectedItems.some((c) => c.settings.pinned)) {
        showWarningToast({
          title: "Cannot Archive Pinned Conversation",
          message: "Please unpin the selected conversations before archiving.",
        });
        return;
      }
      selectedItems.forEach((c) =>
        archiveConversation(c.id, {
          onError: onBulkError("Couldn't archive"),
          onSuccess: () =>
            queryClient.invalidateQueries({ queryKey: ["conversations"] }),
        }),
      );
    }
    endSelection();
  };

  const handleBulkDelete = () => {
    endSelection();
  };

  const [modalVisible, setModalVisible] = useState(false);
  const hasSetupPin = usePinStore((s) => s.hasSetupPin);
  const hasPromptedPinSetup = usePinStore((s) => s.hasPromptedPinSetup);
  const setPromptedPinSetup = usePinStore((s) => s.setPromptedPinSetup);

  useEffect(() => {
    if (!hasSetupPin && !hasPromptedPinSetup) {
      setModalVisible(true);
    }
  }, [hasSetupPin, hasPromptedPinSetup]);

  const handleDismiss = () => {
    setPromptedPinSetup();
    setModalVisible(false);
  };

  const renderContent = () => {
    if (isSearching) {
      return (
        <SearchResultsList
          users={searchResults}
          isLoading={isSearchFetching && searchResults.length === 0}
          hasNextPage={!!hasNextPage}
          onEndReached={fetchNextPage}
          onPressUser={() => setSearch("")}
        />
      );
    }

    if (isLoading) {
      return <ActivityIndicator className="mt-8" size="large" />;
    }

    if (isError) {
      return (
        <ThemedText className="text-center mt-8">
          Couldn't load chats.
        </ThemedText>
      );
    }

    if (isEmpty) {
      return <ChatListEmpty matches={matches} />;
    }

    return (
      <ChatList
        conversations={displayConversations ?? []}
        onRefresh={refetch}
        isRefetching={isRefetching}
        isSelecting={isSelecting}
        selectedConversations={selectedConversations}
        setSelectedConversations={setSelectedConversations}
        currentUserId={currentUserId}
        pinnedCount={pinnedCount}
      />
    );
  };

  return (
    <>
      <View className="flex-1 items-center bg-background relative">
        <MainListHeader
          selectionMode={isSelecting}
          selectedCount={selectedConversations.length}
          isAllSelectedPinned={isAllSelectedPinned}
          isAllSelectedMuted={isAllSelectedMuted}
          isAllSelectedArchived={isAllSelectedArchived}
          onCancelSelection={endSelection}
          onPin={handleBulkPin}
          onMute={handleBulkMute}
          onArchive={handleBulkArchive}
          onDelete={handleBulkDelete}
          searchValue={search}
          onSearchChange={setSearch}
        />
        <View className="flex-1 w-full">{renderContent()}</View>

        <CreateNewChatButton />
      </View>
      <PinPromptModal modalVisible={modalVisible} onDismiss={handleDismiss} />
    </>
  );
}
