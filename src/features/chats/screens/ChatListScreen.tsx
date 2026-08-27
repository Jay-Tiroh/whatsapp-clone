import { usePinStore } from "@/core/store/pinStore";
import { mockConversationListResponse } from "@/features/chats/mocks/conversation.mocks";
import { mockContactMatches } from "@/features/chats/mocks/discovery.mocks";
import { useExitOnDoubleBack } from "@/shared/hooks/useExitOnDoubleBack";
import { useEffect, useState } from "react";
import { View } from "react-native";
import ChatList from "../components/ChatList";
import ChatListEmpty from "../components/ChatListEmpty";
import ListHeader from "../components/MainListHeader";
import PinPromptModal from "../components/PinPromptModal";

export default function ChatListScreen() {
  useExitOnDoubleBack("Press back again to exit");
  // const { data, isLoading, isError, refetch, isRefetching } =
  //   useGetConversations({ limit: 20 });
  const data = mockConversationListResponse;
  const { isLoading, isError, refetch, isRefetching } = {
    isLoading: false,
    isError: false,
    refetch: () => {},
    isRefetching: false,
  };
  const isEmpty = !isLoading && (data?.items.length ?? 0) === 0;

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

  // const { matches, isLoading: matchesLoading } = useMatchedContacts();
  const matches = mockContactMatches;

  // --- selection state, lifted from ChatList ---
  const [selectedConversations, setSelectedConversations] = useState<string[]>(
    [],
  );
  const isSelecting = selectedConversations.length > 0;
  const handleCancelSelection = () => setSelectedConversations([]);

  return (
    <>
      <View className="flex-1 items-center bg-background">
        <ListHeader
          selectionMode={isSelecting}
          selectedCount={selectedConversations.length}
          onCancelSelection={handleCancelSelection}
        />
        {isEmpty ? (
          <ChatListEmpty matches={matches} />
        ) : (
          <ChatList
            conversations={data?.items ?? []}
            isLoading={isLoading}
            isError={isError}
            onRefresh={refetch}
            isRefetching={isRefetching}
            isSelecting={isSelecting}
            selectedConversations={selectedConversations}
            setSelectedConversations={setSelectedConversations}
          />
        )}
      </View>
      <PinPromptModal modalVisible={modalVisible} onDismiss={handleDismiss} />
    </>
  );
}
