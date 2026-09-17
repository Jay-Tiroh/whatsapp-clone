import ThemedText from "@/shared/components/ThemedText";
import { useLocalSearchParams } from "expo-router";
import { View } from "react-native";

export default function FolderScreen() {
  const { folder } = useLocalSearchParams();
  return (
    <View className="flex-1 items-center justify-center w-full">
      <ThemedText>FolderScreen: {folder}</ThemedText>
    </View>
  );
}
