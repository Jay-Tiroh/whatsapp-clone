// features/chats/components/ChatItem.tsx
import MuteIcon from "@/assets/icons/mute.svg";
import TrashIcon from "@/assets/icons/trash.svg";
import ThemedText from "@/shared/components/ThemedText";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import Foundation from "@expo/vector-icons/Foundation";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Octicons from "@expo/vector-icons/Octicons";
import { useEffect, useRef, useState } from "react";
import { Image, Pressable, View } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import Swipeable, {
  SwipeableMethods,
} from "react-native-gesture-handler/ReanimatedSwipeable";
import { withUniwind } from "uniwind";
import type { ConversationResponseDto } from "../types/conversation.types";

const StyledMaterialIcons = withUniwind(MaterialIcons);
const StyledFontAwesome6 = withUniwind(FontAwesome6);
const StyledMuteIcon = withUniwind(MuteIcon);
const StyledTrashIcon = withUniwind(TrashIcon);
const StyledOcticons = withUniwind(Octicons);
const StyledFoundation = withUniwind(Foundation);
const StyledTouchableOpacity = withUniwind(TouchableOpacity);

interface ChatItemProps {
  conversation: ConversationResponseDto;
  currentUserId?: string;
  isSelecting?: boolean;
  setSelectedConversations?: React.Dispatch<React.SetStateAction<string[]>>;
  selectedConversations?: string[];
}

function formatTime(iso: string) {
  const date = new Date(iso);
  return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

export default function ChatItem({
  conversation,
  currentUserId,
  isSelecting,
  setSelectedConversations,
  selectedConversations,
}: ChatItemProps) {
  const [isPinned, setIsPinned] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const { otherParticipant, latestMessage, unreadCount, lastActivityAt } =
    conversation;
  const isGroup = conversation.type !== "direct";
  const isYou = !!latestMessage && latestMessage.senderId === currentUserId;
  const hasUnread = unreadCount > 0;

  const handlePinPress = () => {
    setIsPinned((prev) => !prev);
    swipeableRef.current?.close();
  };
  const handleMutePress = () => {
    setIsMuted((prev) => !prev);
    swipeableRef.current?.close();
  };
  const handleDeletePress = () => {
    swipeableRef.current?.close();
  };
  const handleArchivePress = () => {
    swipeableRef.current?.close();
  };
  const swipeableRef = useRef<SwipeableMethods>(null);
  const [isPressed, setIsPressed] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const isInteracting = isPressed || isOpen;

  const handleLongPress = () => {
    if (setSelectedConversations) {
      setSelectedConversations((prev: string[]) => {
        if (prev.includes(conversation.id)) {
          return prev.filter((id: string) => id !== conversation.id);
        } else {
          return [...prev, conversation.id];
        }
      });
    }
  };

  const handlePress = () => {
    if (isSelecting && setSelectedConversations) {
      setSelectedConversations((prev: string[]) => {
        if (prev.includes(conversation.id)) {
          return prev.filter((id: string) => id !== conversation.id);
        } else {
          return [...prev, conversation.id];
        }
      });
    } else {
      // Navigate to the chat screen for this conversation
      // navigation.navigate('ChatScreen', { conversationId: conversation.id });
    }
  };
  useEffect(() => {
    selectedConversations?.includes(conversation.id)
      ? setIsPressed(true)
      : setIsPressed(false);
  }, [selectedConversations, conversation.id]);

  const renderLeftActions = () => (
    <View className="flex-row gap-2 items-center h-20 pl-safe-offset-6 pr-2">
      <StyledTouchableOpacity
        activeOpacity={0.7}
        className="chat-item-swipe-card bg-warning"
        onPress={handleMutePress}
      >
        {isMuted ? (
          <StyledFoundation name="volume" size={24} className="text-white/90" />
        ) : (
          <StyledMuteIcon className="size-6 text-white/90" />
        )}
        <ThemedText type="bodyMd" weight="medium" className="text-white/90">
          {isMuted ? "Unmute" : "Mute"}
        </ThemedText>
      </StyledTouchableOpacity>
      <StyledTouchableOpacity
        activeOpacity={0.7}
        className="chat-item-swipe-card bg-neutral-500"
        onPress={handlePinPress}
      >
        {isPinned ? (
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
        <ThemedText type="bodyMd" weight="medium" className="text-white/90">
          {isPinned ? "Unpin" : "Pin"}
        </ThemedText>
      </StyledTouchableOpacity>
    </View>
  );

  const renderRightActions = () => (
    <View className="flex-row gap-2 items-center h-20 pr-safe-offset-6 pl-2">
      <StyledTouchableOpacity
        activeOpacity={0.7}
        className="chat-item-swipe-card bg-danger"
        onPress={handleDeletePress}
      >
        <StyledTrashIcon className="size-6 text-white/90" />
        <ThemedText type="bodyMd" weight="medium" className="text-white/90">
          Delete
        </ThemedText>
      </StyledTouchableOpacity>
      <StyledTouchableOpacity
        activeOpacity={0.7}
        className="chat-item-swipe-card bg-neutral-500"
        onPress={handleArchivePress}
      >
        <StyledFontAwesome6
          name="box-archive"
          size={24}
          className="text-white/90"
        />
        <ThemedText type="bodyMd" weight="medium" className="text-white/90">
          Archive
        </ThemedText>
      </StyledTouchableOpacity>
    </View>
  );

  return (
    <Swipeable
      ref={swipeableRef}
      renderLeftActions={renderLeftActions}
      renderRightActions={renderRightActions}
      friction={2}
      leftThreshold={40}
      rightThreshold={40}
      onSwipeableWillOpen={() => setIsOpen(true)}
      onSwipeableWillClose={() => setIsOpen(false)}
      enabled={!isSelecting}
    >
      <Pressable
        onLongPress={handleLongPress}
        onPress={handlePress}
        className={`w-full px-safe-offset-6 gap-4 flex-row items-center rounded-xl h-20 ${
          isInteracting ? "bg-primary-50 dark:bg-neutral-700" : "bg-background"
        }`}
      >
        <View className="w-fit size-14 rounded-full relative">
          <Image
            source={
              otherParticipant.avatarUrl
                ? { uri: otherParticipant.avatarUrl }
                : require("@/assets/images/avatar.png")
            }
            className="w-full size-14 rounded-full"
          />
          <View className="border-2 border-background bg-primary-400 size-4 rounded-full absolute bottom-0 right-0" />
        </View>
        <View className="gap-1 flex-1">
          <View className="flex-row justify-between gap-2">
            <View className="flex-1 flex-row gap-2 items-center">
              {isGroup && (
                <StyledMaterialIcons
                  name="groups"
                  size={24}
                  className="text-primary-400"
                />
              )}
              <ThemedText
                type="bodyLg"
                weight="bold"
                ellipsizeMode="tail"
                numberOfLines={1}
                className=""
              >
                {otherParticipant.displayName ?? "Unknown"}
              </ThemedText>
              {isMuted && (
                <StyledMuteIcon className="size-5 text-neutral-300 dark:text-neutral-200" />
              )}
            </View>
            <ThemedText
              type="bodyMd"
              className={hasUnread ? "text-primary-400" : "text-neutral-300"}
            >
              {formatTime(lastActivityAt)}
            </ThemedText>
          </View>
          <View className="flex-row gap-2 items-center">
            <View className="flex-row flex-1 gap-1 items-center pr-2">
              {isYou && (
                <ThemedText type="bodyLg" weight="medium">
                  You:
                </ThemedText>
              )}
              <ThemedText
                type="bodyLg"
                color="muted"
                ellipsizeMode="tail"
                numberOfLines={1}
                className="w-full max-w-11/12"
              >
                {latestMessage?.preview ?? "No messages yet"}
              </ThemedText>
            </View>
            {hasUnread && (
              <View className="size-6 rounded-full items-center justify-center bg-primary-400">
                <ThemedText weight="bold">{unreadCount}</ThemedText>
              </View>
            )}
            {isPinned && (
              <StyledMaterialIcons
                name="push-pin"
                size={20}
                className=" text-neutral-300 dark:text-neutral-200"
              />
            )}
          </View>
        </View>
      </Pressable>
    </Swipeable>
  );
}
