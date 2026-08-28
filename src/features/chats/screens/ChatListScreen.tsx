import ChatList from "@/features/chats/components/ChatList";
import ChatListEmpty from "@/features/chats/components/ChatListEmpty";
import CreateNewChatButton from "@/features/chats/components/CreateNewChatBtn";
import MainListHeader from "@/features/chats/components/MainListHeader";
import SearchResultsList from "@/features/chats/components/SearchResultsList";
import { useSearchUsers } from "@/features/chats/hooks/useDiscovery";
import { mockConversationListResponse } from "@/features/chats/mocks/conversation.mocks";
import { mockContactMatches } from "@/features/chats/mocks/discovery.mocks";
import { useChatsStore } from "@/features/chats/store/chatsStore";
import ThemedText from "@/shared/components/ThemedText";
import { showWarningToast } from "@/shared/hooks/showToast";
import { useExitOnDoubleBack } from "@/shared/hooks/useExitOnDoubleBack";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { withUniwind } from "uniwind";

const StyledMaterialIcons = withUniwind(MaterialIcons);
const StyledFontAwesome = withUniwind(FontAwesome);
const StyledIonicons = withUniwind(Ionicons);
const StyledFontAwesome6 = withUniwind(FontAwesome6);
export default function ChatListScreen() {
  useExitOnDoubleBack("Press back again to exit");

  // TODO: Replace with real query hooks
  // const { data, isLoading, isError, refetch, isRefetching } = useGetConversations({ limit: 20 });
  // const { matches, isLoading: matchesLoading } = useMatchedContacts();

  const data = mockConversationListResponse;
  const { isLoading, isError, refetch, isRefetching } = {
    isLoading: false,
    isError: false,
    refetch: () => {},
    isRefetching: false,
  };
  const matches = mockContactMatches;
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

  // Store selections
  const pinnedChats = useChatsStore((s) => s.pinnedChatIds);
  const archivedChats = useChatsStore((s) => s.archivedChatIds);
  const mutedChats = useChatsStore((s) => s.mutedChatIds);

  // Store actions
  const pin = useChatsStore((s) => s.pin);
  const unpin = useChatsStore((s) => s.unpin);
  const mute = useChatsStore((s) => s.mute);
  const unmute = useChatsStore((s) => s.unmute);
  const archive = useChatsStore((s) => s.archive);
  const unarchive = useChatsStore((s) => s.unarchive);

  // Lists splitting
  const pinnedConversations = data?.items.filter((c) =>
    pinnedChats.includes(c.id),
  );
  const unarchivedConversations =
    data?.items.filter(
      (c) => !archivedChats.includes(c.id) && !pinnedChats.includes(c.id),
    ) ?? [];
  const displayConversations = [
    ...pinnedConversations,
    ...unarchivedConversations,
  ];
  const archivedConversations =
    data?.items.filter(
      (c) => archivedChats.includes(c.id) && !pinnedChats.includes(c.id),
    ) ?? [];

  // Selection state
  const [selectedConversations, setSelectedConversations] = useState<string[]>(
    [],
  );
  const isSelecting = selectedConversations.length > 0;

  const endSelection = () => setSelectedConversations([]);

  // Bulk operation boolean derivations
  const conversations = data?.items ?? [];
  const selectedItems = conversations.filter((c) =>
    selectedConversations.includes(c.id),
  );

  const isAllSelectedPinned =
    selectedItems.length > 0 &&
    selectedItems.every((c) => pinnedChats.includes(c.id));

  const isAllSelectedMuted =
    selectedItems.length > 0 &&
    selectedItems.every((c) => mutedChats.includes(c.id));

  const isAllSelectedArchived =
    selectedItems.length > 0 &&
    selectedItems.every((c) => archivedChats.includes(c.id));

  // Bulk operation handlers
  const handleBulkPin = () => {
    if (isAllSelectedPinned) {
      selectedConversations.forEach(unpin);
    } else {
      const newlyPinning = selectedConversations.filter(
        (id) => !pinnedChats.includes(id),
      );
      if (pinnedChats.length + newlyPinning.length > 3) {
        showWarningToast({
          title: "Pin Limit Reached",
          message: "You can only pin up to 3 conversations.",
        });
        return;
      }
      selectedConversations.forEach(pin);
    }
    endSelection();
  };

  const handleBulkMute = () => {
    selectedConversations.forEach(isAllSelectedMuted ? unmute : mute);
    endSelection();
  };

  const handleBulkArchive = () => {
    selectedConversations.forEach(isAllSelectedArchived ? unarchive : archive);
    endSelection();
  };

  const handleBulkDelete = () => {
    // wire to your delete action once confirmed
    endSelection();
  };

  const renderContent = () => {
    if (isSearching) {
      return (
        <SearchResultsList
          users={searchResults}
          isLoading={isSearchFetching && searchResults.length === 0}
          hasNextPage={!!hasNextPage}
          onEndReached={fetchNextPage}
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
        archived={archivedConversations ?? []}
        conversations={displayConversations ?? []}
        onRefresh={refetch}
        isRefetching={isRefetching}
        isSelecting={isSelecting}
        selectedConversations={selectedConversations}
        setSelectedConversations={setSelectedConversations}
      />
    );
  };

  const [newOpen, setNewOpen] = useState(false);

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
    </>
  );
}
