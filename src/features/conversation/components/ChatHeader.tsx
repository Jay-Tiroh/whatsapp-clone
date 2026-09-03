import MuteIcon from "@/assets/icons/mute.svg";
import TrashIcon from "@/assets/icons/trash.svg";
import { Conversation } from "@/features/chats/types/conversation.types";
import ThemedText from "@/shared/components/ThemedText";
import { formatTime } from "@/shared/utils/date";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import Fontisto from "@expo/vector-icons/Fontisto";
import Foundation from "@expo/vector-icons/Foundation";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Pressable, View } from "react-native";
import { withUniwind } from "uniwind";

const StyledFontAwesome6 = withUniwind(FontAwesome6);
const StyledFontisto = withUniwind(Fontisto);
const StyledIonicons = withUniwind(Ionicons);
const StyledMaterialIcons = withUniwind(MaterialIcons);
const StyledFoundation = withUniwind(Foundation);
const StyledMuteIcon = withUniwind(MuteIcon);
const StyledTrashIcon = withUniwind(TrashIcon);
const StyledImage = withUniwind(Image);
interface ChatHeaderProps {
  title?: string;
  goBack?: () => void;
  selectionMode?: boolean;
  selectedCount?: number;
  isAllSelectedMuted?: boolean;
  onCancelSelection?: () => void;
  onUnarchive?: () => void;
  onMute?: () => void;
  onDelete?: () => void;
  conversation?: Conversation;
}

export default function ChatHeader({
  title,
  goBack,
  selectionMode = false,
  selectedCount = 0,
  isAllSelectedMuted = false,
  onCancelSelection,
  onUnarchive,
  onMute,
  onDelete,
  conversation,
}: ChatHeaderProps) {
  const router = useRouter();
  const handleGoBack = () => (goBack ? goBack() : router.back());
  console.log(conversation?.lastActivityAt);
  return (
    <View className="w-full bg-primary-400 dark:bg-neutral-700 p-safe-offset-6 pb-6 gap-5 z-99">
      <View className="flex-row justify-center items-center">
        <View className="flex-row items-center gap-6">
          <Pressable className="active:opacity-70" onPress={handleGoBack}>
            <StyledIonicons
              name="chevron-back"
              size={24}
              className="text-white/90"
            />
          </Pressable>
          <View className="flex-row gap-4 items-center flex-1">
            {/*<StyledImage
              source={
                otherParticipant.avatarUrl
                  ? { uri: otherParticipant.avatarUrl }
                  : require("@/assets/images/avatar.png")
              }
              className="w-full h-full rounded-full"
              contentFit="cover"
              cachePolicy="memory-disk"
            />*/}
            <StyledImage
              source={require("@/assets/images/avatar.png")}
              className="size-12 border-.5 border-white rounded-full bg-white"
              contentFit="cover"
              cachePolicy="memory-disk"
              style={{ borderWidth: 2, borderColor: "hsla(0, 0%, 100%, 0.9)" }}
            />
            <View className="gap-1">
              <ThemedText type="bodyXl" weight="bold" className="text-white/90">
                {conversation?.otherParticipant?.displayName ?? "Unknown user"}
              </ThemedText>
              <ThemedText className="text-white/90">
                last seen {formatTime(conversation?.lastActivityAt ?? "")}
              </ThemedText>
            </View>
          </View>
          <View className="flex-row gap-5 items-center">
            <Pressable className="active:opacity-70">
              <StyledFontAwesome6
                name="video"
                size={24}
                className="text-white/90"
              />
            </Pressable>
            <Pressable className="active:opacity-70">
              <StyledMaterialIcons
                name="call"
                size={24}
                className="text-white/90"
              />
            </Pressable>
          </View>
        </View>
        <View className="absolute right-6">
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

            <Pressable className="active:opacity-70" onPress={onUnarchive}>
              <StyledMaterialIcons
                name="unarchive"
                size={24}
                className="text-white/90"
              />
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
        </View>
      )}
    </View>
  );
}
