import SharedHeader from "@/features/conversation/components/SharedHeader";
import StarredMessagesScreen from "@/features/conversation/components/StarredMessages";
import { View } from "react-native";

export default function StarredMessages() {
  return (
    <View className="flex-1">
      <SharedHeader title="Starred Messages" hasSearch />
      <StarredMessagesScreen />
    </View>
  );
}
