import ThemedButton from "@/shared/components/ThemedButton";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Modal,
  Pressable,
  Text,
  View,
} from "react-native";
import { withUniwind } from "uniwind";

const StyledFontAwesome6 = withUniwind(FontAwesome6);
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const { height: SCREEN_HEIGHT } = Dimensions.get("window");

type ModalProps = {
  modalVisible: boolean;
  setModalVisible: (visible: boolean) => void;
};

export default function PinPromptModal({
  modalVisible,
  setModalVisible,
}: ModalProps) {
  // Controls whether the RN <Modal> is actually mounted, so the
  // close animation can finish before it unmounts.
  const [isRendered, setIsRendered] = useState(modalVisible);
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

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

  const handleClose = () => setModalVisible(false);
  const router = useRouter();
  const handleYesPress = () => {
    handleClose();
    router.push("/settings/setup-pin");
  };
  return (
    <>
      <Modal
        visible={isRendered}
        animationType="none"
        transparent
        onRequestClose={handleClose}
        statusBarTranslucent
      >
        <AnimatedPressable
          className="flex-1 justify-center bg-neutral-900/40 p-6"
          style={{ opacity: backdropOpacity }}
          onPress={handleClose}
        >
          <Animated.View
            style={{ transform: [{ translateY }] }}
            className="w-full"
          >
            <Pressable
              className="w-full min-h-75.5 h-fit bg-white dark:bg-neutral-700 rounded-2xl gap-6.75 relative pt-14
              "
            >
              <View className="size-16 bg-white dark:bg-neutral-600 rounded-2xl justify-center items-center absolute -top-8 left-1/2 -translate-x-8 shadow-sm z-10 ">
                <StyledFontAwesome6
                  name="lock"
                  size={32}
                  colorClassName="accent-primary-400"
                />
              </View>
              <View className="gap-2 max-w-70 mx-auto p-6">
                <Text className="text-h4 font-display-bold text-neutral-900 dark:text-white/90 text-center">
                  Do you want to add a pin code?
                </Text>
                <Text className="text-body-md font-display-regular text-neutral-300 dark:text-neutral-200 text-center">
                  Add a verification code to make it more secure.
                </Text>
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
        </AnimatedPressable>
      </Modal>
    </>
  );
}
