import { useSheetStore } from "@/core/store/sheetStore";
import Header from "@/features/folder/components/FolderSheetHeader";
import AddParticipants from "@/shared/components/AddParticipants";
import Spacer from "@/shared/components/Spacer";
import ThemedButton from "@/shared/components/ThemedButton";
import ThemedTextInput from "@/shared/components/ThemedTextInput";
import { logger } from "@/shared/utils/logger";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { ScrollView, View } from "react-native";
import { withUniwind } from "uniwind";

const StyledFontAwesome6 = withUniwind(FontAwesome6);
const StyledMaterialCommunityIcons = withUniwind(MaterialCommunityIcons);
const StyledScrollView = withUniwind(ScrollView);

export default function NewFolder() {
  const openSheet = useSheetStore((state) => state.openSheet);
  const handleNext = () => {
    logger.log("Opening Folder Sheet");
    openSheet(<AddParticipants />, {
      detents: [0.9],
    });
  };
  return (
    <>
      <Header title="New Folder" stage={1} />
      <Spacer size={24} />
      {/*form*/}

      <View className=" mx-auto rounded-full true-center size-37 bg-neutral-100 dark:bg-neutral-500">
        <StyledFontAwesome6
          name="folder-open"
          size={68}
          className="text-white/90"
        />
        <View className="size-10 rounded-full true-center bg-primary-400 absolute bottom-0 right-0 ">
          <StyledMaterialCommunityIcons
            name="camera-plus"
            size={20}
            className="text-white/90"
          />
        </View>
      </View>
      <StyledScrollView
        nestedScrollEnabled
        contentContainerClassName="pb-safe-offset-100"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1">
          <View className="p-6 gap-6">
            <ThemedTextInput label="Folder Name" placeholder="Type name.." />
            <ThemedTextInput
              label="Description (Optional)"
              placeholder="Type description..."
            />
          </View>
        </View>
        <Spacer size={30} />
        <View className="px-6 ">
          <ThemedButton label="Next" onPress={handleNext} />
        </View>
      </StyledScrollView>
    </>
  );
}
