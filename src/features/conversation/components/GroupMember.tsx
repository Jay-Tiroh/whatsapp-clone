import ThemedText from "@/shared/components/ThemedText";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Image } from "expo-image";
import React, { useRef, useState } from "react";
import { Pressable, View } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import Swipeable, {
  SwipeableMethods,
} from "react-native-gesture-handler/ReanimatedSwipeable";
import { withUniwind } from "uniwind";

const StyledImage = withUniwind(Image);
const StyledMaterialIcons = withUniwind(MaterialIcons);
const StyledFontAwesome6 = withUniwind(FontAwesome6);
const StyledTouchableOpacity = withUniwind(TouchableOpacity);

export interface Member {
  id: string;
  name: string;
  avatarUrl?: string;
  statusText: string;
  isOnline: boolean;
}

interface MemberItemProps {
  member: Member;
  onMessage: (id: string) => void;
  onInfo: (id: string) => void;
  onKick: (id: string) => void;
}

const MemberItem = React.memo(
  ({ member, onMessage, onInfo, onKick }: MemberItemProps) => {
    const swipeableRef = useRef<SwipeableMethods>(null);

    const handleAction = (action: (id: string) => void) => {
      action(member.id);
      swipeableRef.current?.close();
    };

    const [isOpen, setIsOpen] = useState(false);
    const handlePress = {};

    const renderLeftActions = () => (
      <View className="flex-row gap-2 items-center h-20 pl-safe-offset-6 pr-2">
        <StyledTouchableOpacity
          activeOpacity={0.7}
          className="chat-item-swipe-card bg-primary-400"
          onPress={() => handleAction(onMessage)}
        >
          <StyledMaterialIcons
            name="chat"
            size={24}
            className="text-white/90"
          />
          <ThemedText type="bodyMd" weight="medium" className="text-white/90">
            Message
          </ThemedText>
        </StyledTouchableOpacity>

        <StyledTouchableOpacity
          activeOpacity={0.7}
          className="chat-item-swipe-card bg-neutral-100 dark:bg-neutral-500"
          onPress={() => handleAction(onInfo)}
        >
          <StyledMaterialIcons
            name="info-outline"
            size={24}
            className="text-white/90"
          />
          <ThemedText type="bodyMd" weight="medium" className="text-white/90">
            Info
          </ThemedText>
        </StyledTouchableOpacity>
      </View>
    );

    const renderRightActions = () => (
      <View className="flex-row gap-2 items-center h-20 pr-safe-offset-6 pl-2">
        <StyledTouchableOpacity
          activeOpacity={0.7}
          className="chat-item-swipe-card bg-danger"
          onPress={() => handleAction(onKick)}
        >
          <StyledFontAwesome6
            name="user-minus"
            size={20}
            className="text-white/90"
          />
          <ThemedText type="bodyMd" weight="medium" className="text-white/90">
            Kick
          </ThemedText>
        </StyledTouchableOpacity>
      </View>
    );

    return (
      <Swipeable
        ref={swipeableRef}
        renderLeftActions={renderLeftActions}
        renderRightActions={renderRightActions}
        onSwipeableWillOpen={() => setIsOpen(true)}
        onSwipeableWillClose={() => setIsOpen(false)}
        friction={2}
        leftThreshold={40}
        rightThreshold={40}
      >
        <Pressable
          className={`w-full px-safe-offset-6 gap-4 flex-row items-center rounded-xl h-20 ${
            isOpen ? "bg-primary-50 dark:bg-neutral-700" : "bg-background"
          }`}
        >
          <View className="size-14 rounded-full relative">
            <StyledImage
              source={
                member.avatarUrl
                  ? { uri: member.avatarUrl }
                  : require("@/assets/images/avatar.png")
              }
              className="w-full h-full rounded-full"
              contentFit="cover"
              cachePolicy="memory-disk"
            />
          </View>
          <View className="gap-1 flex-1">
            <ThemedText
              type="bodyLg"
              weight="bold"
              ellipsizeMode="tail"
              numberOfLines={1}
            >
              {member.name}
            </ThemedText>
            <ThemedText
              type="bodyMd"
              className={
                member.isOnline
                  ? "text-primary-400 dark:text-primary-400"
                  : "text-neutral-300"
              }
            >
              {member.statusText}
            </ThemedText>
          </View>
        </Pressable>
      </Swipeable>
    );
  },
);

export default MemberItem;
