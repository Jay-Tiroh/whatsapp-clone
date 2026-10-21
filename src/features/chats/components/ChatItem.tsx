import MuteIcon from "@/assets/icons/mute.svg";
import TrashIcon from "@/assets/icons/trash.svg";
import { useFolderModalStore } from "@/core/store/modalStore";
import { useIsUserOnline } from "@/core/store/presenceStore";
import {
  useArchiveConversation,
  useMuteConversation,
  usePinConversation,
  useUnarchiveConversation,
  useUnmuteConversation,
  useUnpinConversation,
} from "@/features/chats/hooks/useConversations";
import ThemedText from "@/shared/components/ThemedText";
import { showSuccessToast, showWarningToast } from "@/shared/hooks/showToast";
import { formatTime } from "@/shared/utils/date";
import { getErrorMessage } from "@/shared/utils/errors";
import Entypo from "@expo/vector-icons/Entypo";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import Foundation from "@expo/vector-icons/Foundation";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Octicons from "@expo/vector-icons/Octicons";
import { useQueryClient } from "@tanstack/react-query";
import { Image } from "expo-image";
import { Href, useRouter } from "expo-router";
import React, { useRef, useState } from "react";
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
import type {
  Conversation,
  MuteConversationDto,
} from "../types/conversation.types";
const StyledImage = withUniwind(Image);
const StyledMaterialIcons = withUniwind(MaterialIcons);
const StyledEntypo = withUniwind(Entypo);
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
  pinnedCount?: number;
}
const MAX_PINNED = 3;
const MUTE_DURATIONS: MuteConversationDto[] = [
  { duration: "8_hours" },
  { duration: "24_hours" },
  { duration: "7_days" },
  { duration: "always" },
];
const ChatItem = React.memo(
  ({
    conversation,
    currentUserId,
    isSelecting,
    isSelected = false,
    onToggleSelect,
    isArchived = false,
    pinnedCount = 0,
  }: ChatItemProps) => {
    const router = useRouter();
    const queryClient = useQueryClient();
    const { mutate: archive } = useArchiveConversation();
    const { mutate: unarchive } = useUnarchiveConversation();
    const { mutate: pin } = usePinConversation();
    const { mutate: unpin } = useUnpinConversation();
    const { mutate: mute } = useMuteConversation();
    const { mutate: unmute } = useUnmuteConversation();

    const isPinned = conversation.settings.pinned;
    const isMuted = conversation.settings.muted;

    const closeSwipe = () => swipeableRef.current?.close();
    const onMutationError = (title: string) => (err: unknown) =>
      showWarningToast({
        title,
        message: getErrorMessage(err) ?? "Please try again.",
      });

    const { latestMessage, unreadCount, lastActivityAt } = conversation;
    const isGroup = conversation.type === "group";

    // Compute display-name/avatar for either type, once, outside the branch
    const displayName = isGroup
      ? conversation.name
      : (conversation.otherParticipant.displayName ?? "Unknown");

    const avatarUrl = isGroup
      ? conversation.avatarUrl
      : conversation.otherParticipant.avatarUrl;

    const isYou = !!latestMessage && latestMessage.senderId === currentUserId;
    const hasUnread = unreadCount > 0;
    const otherParticipantId =
      conversation.type === "direct"
        ? conversation.otherParticipant.id
        : undefined;
    const isOnline = useIsUserOnline(otherParticipantId);
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
      closeSwipe();
      if (pinnedCount >= MAX_PINNED) {
        showWarningToast({
          title: "Pin Limit Reached",
          message: `You can only pin up to ${MAX_PINNED} conversations.`,
        });
        return;
      }
      pin(conversation.id, {
        onError: onMutationError("Couldn't pin conversation"),
      });
    };

    const handleUnpinPress = () => {
      closeSwipe();
      unpin(conversation.id, {
        onError: onMutationError("Couldn't unpin conversation"),
      });
    };

    const handleMutePress = () => {
      closeSwipe();
      mute(
        { conversationId: conversation.id, payload: MUTE_DURATIONS[0] }, // fill in per MuteConversationDto
        { onError: onMutationError("Couldn't mute conversation") },
      );
    };

    const handleUnmutePress = () => {
      closeSwipe();
      unmute(conversation.id, {
        onError: onMutationError("Couldn't unmute conversation"),
      });
    };

    const handleArchivePress = () => {
      closeSwipe();
      if (isPinned) {
        showWarningToast({
          title: "Cannot Archive Pinned Conversation",
          message: "Please unpin the conversation before archiving.",
        });
        return;
      }
      archive(conversation.id, {
        onSuccess: () => {
          showSuccessToast({ title: "Conversation Archived" });
          collapseAndThen(() =>
            queryClient.invalidateQueries({ queryKey: ["conversations"] }),
          );
        },
        onError: onMutationError("Error Archiving Conversation"),
      });
    };

    const handleUnarchivePress = () => {
      closeSwipe();
      unarchive(conversation.id, {
        onSuccess: () => {
          showSuccessToast({ title: "Conversation Unarchived" });
          collapseAndThen(() =>
            queryClient.invalidateQueries({ queryKey: ["conversations"] }),
          );
        },
        onError: onMutationError("Error Unarchiving Conversation"),
      });
    };
    const handleDeletePress = () => swipeableRef.current?.close();

    const handleLongPress = () => {
      if (onToggleSelect) {
        onToggleSelect(conversation.id);
      }
    };

    const handlePress = () => {
      if (isSelecting && onToggleSelect) {
        onToggleSelect(conversation.id);
      } else {
        router.push(`/chats/${conversation.id}` as Href);
      }
    };

    const { onOpen } = useFolderModalStore();
    const handleMorePress = () => {
      onOpen();
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

        <StyledTouchableOpacity
          activeOpacity={0.7}
          className="chat-item-swipe-card bg-neutral-100"
          onPress={handleMorePress}
        >
          <StyledEntypo
            name="dots-three-horizontal"
            size={24}
            className="text-white/90"
          />
          <ThemedText type="bodyMd" weight="medium" className="text-white/90">
            More
          </ThemedText>
        </StyledTouchableOpacity>
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
            <View className="size-14 rounded-full relative">
              <StyledImage
                source={
                  avatarUrl
                    ? { uri: avatarUrl }
                    : require("@/assets/images/avatar.png")
                }
                className="w-full h-full rounded-full"
                contentFit="cover"
                cachePolicy="memory-disk"
              />
              {isOnline && (
                <View className="border-2 border-background bg-primary-400 size-4 rounded-full absolute bottom-0 right-0" />
              )}
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
                    {displayName}
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
      prevProps.isArchived === nextProps.isArchived &&
      prevProps.pinnedCount === nextProps.pinnedCount &&
      prevProps.conversation.lastActivityAt ===
        nextProps.conversation.lastActivityAt &&
      prevProps.conversation.unreadCount ===
        nextProps.conversation.unreadCount &&
      prevProps.conversation.updatedAt === nextProps.conversation.updatedAt &&
      prevProps.conversation.settings.muted ===
        nextProps.conversation.settings.muted &&
      prevProps.conversation.settings.pinned ===
        nextProps.conversation.settings.pinned
    );
  },
);

export default ChatItem;
