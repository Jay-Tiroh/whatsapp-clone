import MuteIcon from "@/assets/icons/mute.svg";
import TrashIcon from "@/assets/icons/trash.svg";
import ThemedText from "@/shared/components/ThemedText";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import Fontisto from "@expo/vector-icons/Fontisto";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Pressable, TextInput, View } from "react-native";
import { withUniwind } from "uniwind";

const StyledFontisto = withUniwind(Fontisto);
const StyledIonicons = withUniwind(Ionicons);
const StyledMaterialIcons = withUniwind(MaterialIcons);
const StyledFontAwesome6 = withUniwind(FontAwesome6);
const StyledMuteIcon = withUniwind(MuteIcon);
const StyledTrashIcon = withUniwind(TrashIcon);

interface MainListHeaderProps {
  selectionMode?: boolean;
  selectedCount?: number;
  onCancelSelection?: () => void;
  onPin?: () => void;
  onArchive?: () => void;
  onMute?: () => void;
  onDelete?: () => void;
}

export default function MainListHeader({
  selectionMode = false,
  selectedCount = 0,
  onCancelSelection,
  onPin,
  onArchive,
  onMute,
  onDelete,
}: MainListHeaderProps) {
  return (
    <View className="w-full bg-primary-400 dark:bg-neutral-700 min-h-44.5 p-safe-offset-6 pb-6 gap-5">
      <View className="flex-row justify-between items-center">
        <View className="flex-row gap-2 items-center">
          <ThemedText type="h3" className="text-white/90">
            Chats
          </ThemedText>

          {selectionMode && (
            <>
              <View className="bg-white/90 rounded-full size-2" />
              <ThemedText type="h3" className="text-white/90">
                {selectedCount}
              </ThemedText>
            </>
          )}
        </View>

        {selectionMode && (
          <View className="flex-row gap-6 items-center justify-between">
            <Pressable
              className="active:opacity-70"
              onPress={onCancelSelection}
            >
              <StyledFontisto
                name="close-a"
                size={20}
                className="text-white/90"
              />
            </Pressable>
            <Pressable className="active:opacity-70" onPress={onPin}>
              <StyledMaterialIcons
                name="push-pin"
                size={24}
                className="text-white/90"
              />
            </Pressable>
            <Pressable className="active:opacity-70" onPress={onArchive}>
              <StyledFontAwesome6
                name="box-archive"
                size={24}
                className="text-white/90"
              />
            </Pressable>
            <Pressable className="active:opacity-70" onPress={onMute}>
              <StyledMuteIcon className="text-white/90 size-6" />
            </Pressable>
            <Pressable className="active:opacity-70" onPress={onDelete}>
              <StyledTrashIcon className="text-white/90 scale-120" />
            </Pressable>
          </View>
        )}
      </View>

      <View>
        <View className="h-12 w-full rounded-xl bg-white/6 items-center gap-2 px-3 flex-row border dark:border-neutral-400 border-white/16">
          <StyledIonicons
            name="search-outline"
            size={24}
            className="text-white/90 dark:text-neutral-200"
          />
          <TextInput
            placeholder="Search chat, people, and messages"
            placeholderTextColorClassName="accent-white/90 dark:accent-neutral-200"
            className="text-body-lg text-white/90 flex-1"
          />
        </View>
      </View>
    </View>
  );
}
