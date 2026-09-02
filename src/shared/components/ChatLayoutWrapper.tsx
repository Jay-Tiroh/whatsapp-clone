// @/shared/components/ChatLayoutWrapper.tsx
import { ReactNode } from "react";
import {
  Keyboard,
  Platform,
  Pressable,
  StyleProp,
  View,
  ViewStyle,
} from "react-native";
import {
  KeyboardAvoidingView,
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

  const handleDismissKeyboard = () => {
    if (dismissOnTap) {
      Keyboard.dismiss();
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 w-full"
      style={containerStyle}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Pressable className="flex-1" onPress={handleDismissKeyboard}>
        {children}
      </Pressable>

      <KeyboardStickyView offset={{ closed: 0, opened: -insets.bottom }}>
        <View
          className={bottomInputClassName}
          style={{ paddingBottom: insets.bottom }}
        >
          {bottomInput}
        </View>
      </KeyboardStickyView>
    </KeyboardAvoidingView>
  );
};

export default ChatLayoutWrapper;
