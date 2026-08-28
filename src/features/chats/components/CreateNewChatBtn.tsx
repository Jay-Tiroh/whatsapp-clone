import ThemedText from "@/shared/components/ThemedText";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { BlurView } from "expo-blur";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Animated, {
  FadeInDown,
  FadeOutDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { withUniwind } from "uniwind";

const StyledMaterialIcons = withUniwind(MaterialIcons);
const StyledFontAwesome = withUniwind(FontAwesome);
const StyledIonicons = withUniwind(Ionicons);
const StyledFontAwesome6 = withUniwind(FontAwesome6);

const MENU_ITEMS = [
  {
    key: "chat",
    label: "New Chat",
    render: () => (
      <StyledIonicons
        name="chatbubble-ellipses-sharp"
        size={24}
        className="text-primary-400"
      />
    ),
  },
  {
    key: "contact",
    label: "New Contact",
    render: () => (
      <StyledFontAwesome
        name="user-circle"
        size={24}
        className="text-primary-400"
      />
    ),
  },
  {
    key: "group",
    label: "New Group",
    render: () => (
      <StyledMaterialIcons
        name="groups"
        size={24}
        className="text-primary-400"
      />
    ),
  },
] as const;
const CreateNewChatButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  const backdropOpacity = useSharedValue(0);
  const rotation = useSharedValue(0);

  useEffect(() => {
    backdropOpacity.value = withTiming(isOpen ? 1 : 0, { duration: 200 });
    rotation.value = withSpring(isOpen ? 45 : 0, {
      damping: 14,
      stiffness: 180,
    });
  }, [isOpen]);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const plusStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const close = () => setIsOpen(false);

  return (
    <>
      {isOpen && (
        <Animated.View
          style={[StyleSheet.absoluteFill, backdropStyle]}
          pointerEvents={isOpen ? "auto" : "none"}
        >
          <Pressable style={StyleSheet.absoluteFill} onPress={close}>
            <BlurView
              intensity={80}
              tint="dark"
              style={StyleSheet.absoluteFill}
            />
          </Pressable>
        </Animated.View>
      )}

      <View className="absolute bottom-safe-offset-10 right-safe-offset-5 items-end">
        {isOpen && (
          <View className="gap-3 mb-5">
            {MENU_ITEMS.map((item, index) => (
              <Animated.View
                key={item.key}
                entering={FadeInDown.delay(index * 60)
                  .springify(600)
                  .damping(14)}
                exiting={FadeOutDown.duration(150)}
              >
                <Pressable
                  className="gap-4 flex-row items-center active:opacity-70 bg-white/90 dark:bg-neutral-700 rounded-full w-45 h-14 px-5"
                  onPress={() => {
                    // handle item.key press
                    close();
                  }}
                >
                  {item.render()}
                  <ThemedText
                    type="bodyLg"
                    weight="bold"
                    className="text-neutral-600"
                  >
                    {item.label}
                  </ThemedText>
                </Pressable>
              </Animated.View>
            ))}
          </View>
        )}

        <Pressable
          className="bg-primary-400 size-16 rounded-full true-center "
          onPress={() => setIsOpen((prev) => !prev)}
        >
          <Animated.View style={plusStyle}>
            <StyledFontAwesome6
              name="plus"
              size={24}
              className="text-white/90"
            />
          </Animated.View>
        </Pressable>
      </View>
    </>
  );
};

export default CreateNewChatButton;
