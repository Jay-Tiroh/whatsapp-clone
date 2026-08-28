// MainListHeader.tsx
import MuteIcon from "@/assets/icons/mute.svg";
import TrashIcon from "@/assets/icons/trash.svg";
import SearchBar from "@/features/chats/components/Searchbar";
import ThemedText from "@/shared/components/ThemedText";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import Fontisto from "@expo/vector-icons/Fontisto";
import Foundation from "@expo/vector-icons/Foundation";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Octicons from "@expo/vector-icons/Octicons";
import { Pressable, View } from "react-native";
import { withUniwind } from "uniwind";

const StyledFontisto = withUniwind(Fontisto);
const StyledMaterialIcons = withUniwind(MaterialIcons);
const StyledFontAwesome6 = withUniwind(FontAwesome6);
const StyledOcticons = withUniwind(Octicons);
const StyledFoundation = withUniwind(Foundation);
const StyledMuteIcon = withUniwind(MuteIcon);
const StyledTrashIcon = withUniwind(TrashIcon);

interface MainListHeaderProps {
  selectionMode?: boolean;
  selectedCount?: number;
  isAllSelectedPinned?: boolean;
  isAllSelectedMuted?: boolean;
  isAllSelectedArchived?: boolean;
  onCancelSelection?: () => void;
  onPin?: () => void;
  onArchive?: () => void;
  onMute?: () => void;
  onDelete?: () => void;
  searchValue?: string;
  onSearchChange?: (text: string) => void;
}

export default function MainListHeader({
  selectionMode = false,
  selectedCount = 0,
  isAllSelectedPinned = false,
  isAllSelectedMuted = false,
  isAllSelectedArchived = false,
  onCancelSelection,
  onPin,
  onArchive,
  onMute,
  onDelete,
  searchValue,
  onSearchChange,
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
              {isAllSelectedPinned ? (
                <StyledOcticons
                  name="pin-slash"
                  size={24}
                  className="text-white/90"
                />
              ) : (
                <StyledMaterialIcons
                  name="push-pin"
                  size={24}
                  className="text-white/90"
                />
              )}
            </Pressable>

            <Pressable className="active:opacity-70" onPress={onArchive}>
              {isAllSelectedArchived ? (
                <StyledMaterialIcons
                  name="unarchive"
                  size={24}
                  className="text-white/90"
                />
              ) : (
                <StyledFontAwesome6
                  name="box-archive"
                  size={24}
                  className="text-white/90"
                />
              )}
            </Pressable>

            <Pressable className="active:opacity-70" onPress={onMute}>
              {isAllSelectedMuted ? (
                <StyledFoundation
                  name="volume"
                  size={24}
                  className="text-white/90"
                />
              ) : (
                <StyledMuteIcon className="text-white/90 size-6" />
              )}
            </Pressable>

            <Pressable className="active:opacity-70" onPress={onDelete}>
              <StyledTrashIcon className="text-white/90 scale-120" />
            </Pressable>
          </View>
        )}
      </View>
      <SearchBar value={searchValue} onChangeText={onSearchChange} />
    </View>
  );
}
