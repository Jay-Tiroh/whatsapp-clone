import MuteIcon from "@/assets/icons/mute.svg";
import TrashIcon from "@/assets/icons/trash.svg";
import { useChatsStore } from "@/features/chats/store/chatsStore";
import ThemedText from "@/shared/components/ThemedText";
import { showWarningToast } from "@/shared/hooks/showToast";
import { formatTime } from "@/shared/utils/date";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import Foundation from "@expo/vector-icons/Foundation";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Octicons from "@expo/vector-icons/Octicons";
import { Image } from "expo-image";
import React, { useEffect, useRef, useState } from "react";
import { LayoutChangeEvent, Pressable, View } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import Swipeable, {
  SwipeableMethods,
} from "react-native-gesture-handler/ReanimatedSwipeable";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { withUniwind } from "uniwind";
import type { Conversation } from "../types/conversation.types";

const StyledImage = withUniwind(Image);
const StyledMaterialIcons = withUniwind(MaterialIcons);
const StyledFontAwesome6 = withUniwind(FontAwesome6);
const StyledMuteIcon = withUniwind(MuteIcon);
const StyledTrashIcon = withUniwind(TrashIcon);
const StyledOcticons = withUniwind(Octicons);
const StyledFoundation = withUniwind(Foundation);
const StyledTouchableOpacity = withUniwind(TouchableOpacity);

interface ChatItemProps {
  conversation: Conversation;
  currentUserId?: string;
  isSelecting?: boolean;
  isSelected?: boolean;
  onToggleSelect?: (id: string) => void;
  isArchived?: boolean;
}

const ChatItem = React.memo(
  ({
    conversation,
    currentUserId,
    isSelecting,
    isSelected = false,
    onToggleSelect,
    isArchived = false,
  }: ChatItemProps) => {
    const [isPinned, setIsPinned] = useState(false);
    const [isMuted, setIsMuted] = useState(false);

    const unarchive = useChatsStore((s) => s.unarchive);
    const archive = useChatsStore((s) => s.archive);
    const pin = useChatsStore((s) => s.pin);
    const unpin = useChatsStore((s) => s.unpin);
    const mute = useChatsStore((s) => s.mute);
    const unmute = useChatsStore((s) => s.unmute);
    const mutedChats = useChatsStore((s) => s.mutedChatIds);
    const pinnedChats = useChatsStore((s) => s.pinnedChatIds);

    useEffect(() => {
      mutedChats.includes(conversation.id)
        ? setIsMuted(true)
        : setIsMuted(false);

      pinnedChats.includes(conversation.id)
        ? setIsPinned(true)
        : setIsPinned(false);
    }, [setIsMuted, setIsPinned, mutedChats, pinnedChats, conversation.id]);

    const { otherParticipant, latestMessage, unreadCount, lastActivityAt } =
      conversation;
    const isGroup = conversation.type !== "direct";
    const isYou = !!latestMessage && latestMessage.senderId === currentUserId;
    const hasUnread = unreadCount > 0;

    const swipeableRef = useRef<SwipeableMethods>(null);
    const [isOpen, setIsOpen] = useState(false);
    const isInteracting = isSelected || isOpen;

    // --- Disappearing animation for archive/unarchive ---
    const measuredHeight = useSharedValue(0);
    const heightValue = useSharedValue<number | undefined>(undefined);
    const opacity = useSharedValue(1);

    const handleContainerLayout = (e: LayoutChangeEvent) => {
      if (measuredHeight.value === 0) {
        measuredHeight.value = e.nativeEvent.layout.height;
      }
    };

    const collapseAndThen = (action: () => void) => {
      heightValue.value = measuredHeight.value;
      opacity.value = withTiming(0, {
        duration: 200,
        easing: Easing.out(Easing.ease),
      });
      heightValue.value = withTiming(
        0,
        { duration: 250, easing: Easing.out(Easing.ease) },
        (finished) => {
          if (finished) {
            runOnJS(action)();
          }
        },
      );
    };

    const collapseStyle = useAnimatedStyle(() => ({
      opacity: opacity.value,
      height: heightValue.value,
    }));
    // --- End animation setup ---

    const handlePinPress = () => {
      if (pinnedChats.length >= 3) {
        showWarningToast({
          title: "Pin Limit Reached",
          message: "You can only pin up to 3 conversations.",
        });
      }
      pin(conversation.id);
      swipeableRef.current?.close();
    };

    const handleUnpinPress = () => {
      unpin(conversation.id);
      swipeableRef.current?.close();
    };
    const handleMutePress = () => {
      mute(conversation.id);
      swipeableRef.current?.close();
    };
    const handleUnmutePress = () => {
      unmute(conversation.id);
      swipeableRef.current?.close();
    };

    const handleDeletePress = () => swipeableRef.current?.close();

    const handleArchivePress = () => {
      if (pinnedChats.includes(conversation.id)) {
        showWarningToast({
          title: "Cannot Archive Pinned Conversation",
          message: "Please unpin the conversation before archiving.",
        });
        swipeableRef.current?.close();
        return;
      }
      swipeableRef.current?.close();
      collapseAndThen(() => archive(conversation.id));
    };

    const handleUnarchivePress = () => {
      swipeableRef.current?.close();
      collapseAndThen(() => unarchive(conversation.id));
    };

    const handleLongPress = () => {
      if (onToggleSelect) {
        onToggleSelect(conversation.id);
      }
    };

    const handlePress = () => {
      if (isSelecting && onToggleSelect) {
        onToggleSelect(conversation.id);
      } else {
        // router.push(`/chats/${conversation.id}`)
      }
    };

    const renderLeftActions = () => (
      <View className="flex-row gap-2 items-center h-20 pl-safe-offset-6 pr-2">
        <StyledTouchableOpacity
          activeOpacity={0.7}
          className="chat-item-swipe-card bg-warning"
          onPress={isMuted ? handleUnmutePress : handleMutePress}
        >
          {isMuted ? (
            <StyledFoundation
              name="volume"
              size={24}
              className="text-white/90"
            />
          ) : (
            <StyledMuteIcon className="size-6 text-white/90" />
          )}
          <ThemedText type="bodyMd" weight="medium" className="text-white/90">
            {isMuted ? "Unmute" : "Mute"}
          </ThemedText>
        </StyledTouchableOpacity>
        {!isArchived && (
          <StyledTouchableOpacity
            activeOpacity={0.7}
            className="chat-item-swipe-card bg-neutral-100 dark:bg-neutral-500"
            onPress={isPinned ? handleUnpinPress : handlePinPress}
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
        )}
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
        {isArchived ? (
          <StyledTouchableOpacity
            activeOpacity={0.7}
            className="chat-item-swipe-card bg-neutral-100 dark:bg-neutral-500"
            onPress={handleUnarchivePress}
          >
            <StyledMaterialIcons
              name="unarchive"
              size={24}
              className="text-white/90"
            />
            <ThemedText type="bodyMd" weight="medium" className="text-white/90">
              Unarchive
            </ThemedText>
          </StyledTouchableOpacity>
        ) : (
          <StyledTouchableOpacity
            activeOpacity={0.7}
            className="chat-item-swipe-card bg-neutral-100 dark:bg-neutral-500"
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
        )}
      </View>
    );

    return (
      <Animated.View
        onLayout={handleContainerLayout}
        style={[{ overflow: "hidden" }, collapseStyle]}
      >
        <Swipeable
          ref={swipeableRef}
          renderLeftActions={renderLeftActions}
          renderRightActions={renderRightActions}
          friction={2}
          dragOffsetFromLeftEdge={44}
          dragOffsetFromRightEdge={44}
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
              isInteracting
                ? "bg-primary-50 dark:bg-neutral-700"
                : "bg-background"
            }`}
          >
            <View className=" size-14 rounded-full relative">
              <StyledImage
                source={
                  otherParticipant.avatarUrl
                    ? { uri: otherParticipant.avatarUrl }
                    : require("@/assets/images/avatar.png")
                }
                className="w-full h-full rounded-full"
                contentFit="cover"
                cachePolicy="memory-disk"
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
                  >
                    {otherParticipant.displayName ?? "Unknown"}
                  </ThemedText>
                  {isMuted && (
                    <StyledMuteIcon className="size-5 text-neutral-300 dark:text-neutral-200" />
                  )}
                </View>
                <ThemedText
                  type="bodyMd"
                  className={
                    hasUnread ? "text-primary-400" : "text-neutral-300"
                  }
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
                    <ThemedText weight="bold" className="text-white/90">
                      {unreadCount}
                    </ThemedText>
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
      </Animated.View>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.isSelected === nextProps.isSelected &&
      prevProps.isSelecting === nextProps.isSelecting &&
      prevProps.conversation.lastActivityAt ===
        nextProps.conversation.lastActivityAt &&
      prevProps.conversation.unreadCount ===
        nextProps.conversation.unreadCount &&
      prevProps.conversation.updatedAt === nextProps.conversation.updatedAt
    );
  },
);

export default ChatItem;
