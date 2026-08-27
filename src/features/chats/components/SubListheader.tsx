import MuteIcon from "@/assets/icons/mute.svg";
import TrashIcon from "@/assets/icons/trash.svg";
import ThemedText from "@/shared/components/ThemedText";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import Fontisto from "@expo/vector-icons/Fontisto";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { BlurView } from "expo-blur";
import { useRouter } from "expo-router";
import { Pressable, View } from "react-native";
import { withUniwind } from "uniwind";

const StyledFontisto = withUniwind(Fontisto);
const StyledIonicons = withUniwind(Ionicons);
const StyledMaterialIcons = withUniwind(MaterialIcons);
const StyledFontAwesome6 = withUniwind(FontAwesome6);
const StyledMuteIcon = withUniwind(MuteIcon);
const StyledTrashIcon = withUniwind(TrashIcon);

interface SubListHeaderProps {
  title: string;
  goBack?: () => void;
  selectionMode?: boolean;
  selectedCount?: number;
  onCancelSelection?: () => void;
  onPin?: () => void;
  onArchive?: () => void;
  onMute?: () => void;
  onDelete?: () => void;
}

export default function SubListHeader({
  title,
  goBack,
  selectionMode = false,
  selectedCount = 0,
  onCancelSelection,
  onPin,
  onArchive,
  onMute,
  onDelete,
}: SubListHeaderProps) {
  const router = useRouter();
  const handleGoBack = () => (goBack ? goBack() : router.back());

  return (
    <BlurView
      intensity={5}
      className="w-full bg-primary-400 dark:bg-neutral-700 p-safe-offset-6 pb-6 gap-5"
    >
      <View className="flex-row  justify-center items-center">
        <View className="flex-row  justify-center items-center">
          <Pressable className="active:opacity-70" onPress={handleGoBack}>
            <StyledIonicons
              name="chevron-back"
              size={24}
              className="text-white/90"
            />
          </Pressable>
          <ThemedText
            type="bodyXl"
            weight="bold"
            className="text-white/90 flex-1 text-center"
          >
            {title}
          </ThemedText>
          {selectionMode && (
            <View className="flex-row gap-2 items-center">
              <ThemedText
                type="bodyLg"
                weight="medium"
                className="text-white/90"
              >
                Selected
              </ThemedText>
              <View className="bg-white/90 rounded-full size-1.5" />
              <ThemedText
                type="bodyLg"
                weight="medium"
                className="text-white/90"
              >
                {selectedCount}
              </ThemedText>
            </View>
          )}
        </View>
      </View>

      {selectionMode && (
        <View className="flex-row justify-between items-center">
          <View className="flex-row gap-6 items-center justify-between flex-1">
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
        </View>
      )}
    </BlurView>
  );
}
