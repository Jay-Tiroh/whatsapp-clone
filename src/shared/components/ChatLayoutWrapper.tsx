// @/shared/components/ChatLayoutWrapper.tsx
import { ReactNode } from "react";
import { Keyboard, Pressable, StyleProp, View, ViewStyle } from "react-native";
import {
  KeyboardAwareScrollView,
  KeyboardStickyView,
} from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type ChatLayoutWrapperProps = {
  /** The scrollable body content (e.g., chat messages list or form content) */
  children: ReactNode;
  /** The footer that stays pinned above the keyboard (e.g., input bar) */
  bottomInput: ReactNode;
  /** Optional custom container styling for edge cases className can't cover */
  containerStyle?: StyleProp<ViewStyle>;
  /** Disable tap-outside-to-dismiss behavior if needed */
  dismissOnTap?: boolean;
};
const ChatLayoutWrapper = ({
  children,
  bottomInput,
  containerStyle,
  dismissOnTap = true,
}: ChatLayoutWrapperProps) => {
  const insets = useSafeAreaInsets();

  const handleDismissKeyboard = () => {
    if (dismissOnTap) {
      Keyboard.dismiss();
    }
  };

  return (
    <View className="flex-1 bg-background" style={containerStyle}>
      <KeyboardAwareScrollView
        className="flex-1 bg-background"
        contentContainerClassName="grow bg-background"
        keyboardDismissMode="interactive"
        bottomOffset={16}
      >
        <Pressable
          className="flex-1 bg-background"
          onPress={handleDismissKeyboard}
        >
          {children}
        </Pressable>
      </KeyboardAwareScrollView>

      <KeyboardStickyView
        offset={{ closed: 0, opened: 0 }}
        className="bg-background"
      >
        <View
          className="bg-background"
          style={{
            paddingBottom: insets.bottom,
          }}
        >
          {bottomInput}
        </View>
      </KeyboardStickyView>
    </View>
  );
};
export default ChatLayoutWrapper;
