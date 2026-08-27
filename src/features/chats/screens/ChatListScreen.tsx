import { usePinStore } from "@/core/store/pinStore";
import ChatList from "@/features/chats/components/ChatList";
import ChatListEmpty from "@/features/chats/components/ChatListEmpty";
import MainListHeader from "@/features/chats/components/MainListHeader";
import PinPromptModal from "@/features/chats/components/PinPromptModal";
import { mockConversationListResponse } from "@/features/chats/mocks/conversation.mocks";
import { mockContactMatches } from "@/features/chats/mocks/discovery.mocks";
import ThemedText from "@/shared/components/ThemedText";
import { useExitOnDoubleBack } from "@/shared/hooks/useExitOnDoubleBack";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";

export default function ChatListScreen() {
  useExitOnDoubleBack("Press back again to exit");

  // TODO: Replace with real query hooks
  const data = mockConversationListResponse;
  const { isLoading, isError, refetch, isRefetching } = {
    isLoading: false,
    isError: false,
    refetch: () => {},
    isRefetching: false,
  };
  const matches = mockContactMatches;

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

  const [selectedConversations, setSelectedConversations] = useState<string[]>(
    [],
  );
  const isSelecting = selectedConversations.length > 0;
  const handleCancelSelection = () => setSelectedConversations([]);

  const renderContent = () => {
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
        conversations={data?.items ?? []}
        onRefresh={refetch}
        isRefetching={isRefetching}
        isSelecting={isSelecting}
        selectedConversations={selectedConversations}
        setSelectedConversations={setSelectedConversations}
      />
    );
  };

  return (
    <>
      <View className="flex-1 items-center bg-background">
        <MainListHeader
          selectionMode={isSelecting}
          selectedCount={selectedConversations.length}
          onCancelSelection={handleCancelSelection}
        />
        <View className="flex-1 w-full">{renderContent()}</View>
      </View>
      <PinPromptModal modalVisible={modalVisible} onDismiss={handleDismiss} />
    </>
  );
}
