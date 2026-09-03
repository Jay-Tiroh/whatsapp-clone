// @/shared/components/ChatLayoutWrapper.tsx
import { ReactNode } from "react";
import { Keyboard, Pressable, StyleProp, View, ViewStyle } from "react-native";
import {
  KeyboardStickyView,
  useReanimatedKeyboardAnimation,
} from "react-native-keyboard-controller";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type ChatLayoutWrapperProps = {
  children: ReactNode;
  bottomInput: ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
  dismissOnTap?: boolean;
  bottomInputClassName?: string;
};

const ChatLayoutWrapper = ({
  children,
  bottomInput,
  containerStyle,
  dismissOnTap = true,
  bottomInputClassName,
}: ChatLayoutWrapperProps) => {
  const insets = useSafeAreaInsets();
  const { height } = useReanimatedKeyboardAnimation();

  // `height` runs from 0 (keyboard closed) to a negative value equal to
  // -keyboardHeight (keyboard fully open) — same value KeyboardStickyView
  // uses under the hood, so this stays perfectly in sync with the input bar.
  const listAnimatedStyle = useAnimatedStyle(() => ({
    paddingBottom: -height.value,
  }));

  const handleDismissKeyboard = () => {
    if (dismissOnTap) Keyboard.dismiss();
  };

  return (
    <View className="flex-1 w-full" style={containerStyle}>
      <Animated.View style={[{ flex: 1 }, listAnimatedStyle]}>
        <Pressable className="flex-1" onPress={handleDismissKeyboard}>
          {children}
        </Pressable>
      </Animated.View>

      <KeyboardStickyView offset={{ closed: -insets.bottom, opened: 0 }}>
        <View className={bottomInputClassName}>{bottomInput}</View>
      </KeyboardStickyView>
    </View>
  );
};

export default ChatLayoutWrapper;
