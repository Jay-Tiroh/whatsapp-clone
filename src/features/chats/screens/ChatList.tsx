import ChatListEmpty from "@/features/chats/components/ChatListEmpty";
import PinPromptModal from "@/features/chats/components/PinPromptModal";
import ThemedButton from "@/shared/components/ThemedButton";
import { useState } from "react";
import { View } from "react-native";

export default function ChatList() {
  const isEmpty = false;
  if (isEmpty) {
    return <ChatListEmpty />;
  }
  const [modalVisible, setModalVisible] = useState(false);
  return (
    <View className="flex-1 items-center justify-center bg-background">
      <ThemedButton
        label="Trigger Modal"
        onPress={() => {
          console.log("pressed");
          setModalVisible(true);
        }}
      />

      <PinPromptModal
        modalVisible={modalVisible}
        setModalVisible={setModalVisible}
      />
    </View>
  );
}
