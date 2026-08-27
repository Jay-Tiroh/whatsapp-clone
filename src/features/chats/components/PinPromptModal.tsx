import ThemedButton from "@/shared/components/ThemedButton";
import ThemedText from "@/shared/components/ThemedText";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { BlurView } from "expo-blur";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Modal,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { withUniwind } from "uniwind";

const StyledFontAwesome6 = withUniwind(FontAwesome6);
const { height: SCREEN_HEIGHT } = Dimensions.get("window");

type ModalProps = {
  modalVisible: boolean;
  onDismiss: () => void;
};

export default function PinPromptModal({
  modalVisible,
  onDismiss,
}: ModalProps) {
  const [isRendered, setIsRendered] = useState(modalVisible);
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const router = useRouter();

  useEffect(() => {
    if (modalVisible) {
      setIsRendered(true);
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          damping: 18,
          stiffness: 180,
          mass: 0.9,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: SCREEN_HEIGHT,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start(() => setIsRendered(false));
    }
  }, [modalVisible, backdropOpacity, translateY]);

  const handleClose = () => onDismiss();

  const handleYesPress = () => {
    handleClose();
    router.push("/settings/setup-pin");
  };

  return (
    <Modal
      visible={isRendered}
      animationType="none"
      transparent
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <Animated.View className="flex-1" style={{ opacity: backdropOpacity }}>
        <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />

        <Pressable className="flex-1 justify-center p-6" onPress={handleClose}>
          <Animated.View
            style={{ transform: [{ translateY }] }}
            className="w-full"
          >
            <Pressable className="w-full min-h-75.5 h-fit bg-white dark:bg-neutral-700 rounded-2xl relative pt-14">
              <View className="size-16 bg-white dark:bg-neutral-600 rounded-2xl justify-center items-center absolute -top-8 left-1/2 -translate-x-8 shadow-sm z-10 ">
                <StyledFontAwesome6
                  name="lock"
                  size={32}
                  colorClassName="accent-primary-400"
                />
              </View>

              <View className="gap-2 max-w-70 mx-auto p-6">
                <ThemedText type="h4" className="text-center">
                  Do you want to add a pin code?
                </ThemedText>
                <ThemedText type="bodyMd" color="muted" className="text-center">
                  Add a verification code to make it more secure.
                </ThemedText>
              </View>

              <View className="gap-2 p-6">
                <ThemedButton label="Yes" onPress={handleYesPress} />
                <ThemedButton
                  label="No, Thanks"
                  variant="secondary"
                  className="dark:bg-primary-50"
                  onPress={handleClose}
                />
              </View>
            </Pressable>
          </Animated.View>
        </Pressable>
      </Animated.View>
    </Modal>
  );
}
