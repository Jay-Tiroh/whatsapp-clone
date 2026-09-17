import { useSheetStore } from "@/core/store/sheetStore";
import AddParticipants from "@/shared/components/AddParticipants";
import New from "@/shared/components/New";
import ThemedButton from "@/shared/components/ThemedButton";
import ThemedText from "@/shared/components/ThemedText";
import { logger } from "@/shared/utils/logger";
import { useLocalSearchParams } from "expo-router";
import { useEffect } from "react";
import { View } from "react-native";

export default function FolderListScreen() {
  const { create } = useLocalSearchParams();
  const openSheet = useSheetStore((state) => state.openSheet);
  const openNewFolder = () => {
    openSheet(<New category={"folder"} />, {
      detents: [0.7, 0.8],
    });
  };

  const openAddParticipants = () => {
    openSheet(<AddParticipants />, {
      detents: [0.9],
    });
  };
  useEffect(() => {
    if (create) {
      logger.log("Opening Folder Sheet");
      openNewFolder();
    }
  });

  return (
    <View className="flex-1 items-center justify-center w-full">
      <ThemedText>FolderListScreen, Create: {create}</ThemedText>

      <View className="flex-row gap-3 items-center">
        <ThemedButton label="New folder" onPress={openNewFolder} />
        <ThemedButton label="Add participants" onPress={openAddParticipants} />
      </View>
    </View>
  );
}
