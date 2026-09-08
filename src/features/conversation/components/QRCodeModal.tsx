import ThemedText from "@/shared/components/ThemedText";
import Feather from "@expo/vector-icons/Feather";
import { BlurView } from "expo-blur";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  BackHandler,
  Dimensions,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import QRCode from "react-native-qrcode-svg";
import { withUniwind } from "uniwind";
const { height: SCREEN_HEIGHT } = Dimensions.get("window");

const StyledBlurView = withUniwind(BlurView);

type ModalProps = {
  modalVisible: boolean;
  onDismiss: () => void;
  name: string | undefined;
  phoneNumber?: string | undefined;
  avatarUrl: string | undefined;
  qrPayload?: string;
  isGroup?: boolean;
};

export default function QRCodeModal({
  modalVisible,
  onDismiss,
  phoneNumber,
  avatarUrl,
  name,
  qrPayload,
  isGroup,
}: ModalProps) {
  const [isRendered, setIsRendered] = useState(modalVisible);
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  const handleClose = () => onDismiss();

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

  useEffect(() => {
    if (!isRendered || Platform.OS !== "android") return;
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      handleClose();
      return true;
    });
    return () => sub.remove();
  }, [isRendered]);

  if (!isRendered) return null;

  return (
    <View
      style={StyleSheet.absoluteFill}
      className="z-50"
      pointerEvents="box-none"
    >
      <Animated.View
        style={[StyleSheet.absoluteFill, { opacity: backdropOpacity }]}
        className="relative"
      >
        {Platform.OS === "ios" ? (
          <BlurView
            intensity={80}
            tint="dark"
            style={StyleSheet.absoluteFill}
          />
        ) : (
          <View
            style={[
              StyleSheet.absoluteFill,
              { backgroundColor: "rgba(0,0,0,0.6)" },
            ]}
          />
        )}

        <Pressable className="flex-1 justify-center  p-6" onPress={handleClose}>
          <Animated.View
            style={{ transform: [{ translateY }] }}
            className="w-full gap-20 "
          >
            {/* Main Modal Container */}
            <Pressable className="w-full relative shadow-sm rounded-2xl pt-10">
              {/* Overlapping Profile Image */}
              <View className="absolute top-0 left-1/2 -translate-x-10 z-10 rounded-full border-4 border-off-white shadow-sm bg-white">
                <Image
                  source={
                    avatarUrl
                      ? { uri: avatarUrl }
                      : {
                          uri: "https://i.pravatar.cc/150?u=a042581f4e29026704d",
                        }
                  }
                  className="size-20 rounded-full"
                />
              </View>

              {/* Top Section: Info */}
              <View className="bg-off-white rounded-t-2xl pt-14 pb-6 px-6 items-center gap-1">
                <ThemedText
                  type="h4"
                  className="text-neutral-900 dark:text-neutral-900 w-full text-center"
                >
                  {name ?? "Unknown User"}
                </ThemedText>
                {!isGroup && (
                  <ThemedText
                    type="bodyLg"
                    weight="medium"
                    className="text-neutral-300 dark:text-neutral-300"
                  >
                    {phoneNumber ?? "+61-123-753-555"}
                  </ThemedText>
                )}
              </View>

              {/* Bottom Section: QR Code */}
              <View className="bg-white rounded-b-2xl items-center justify-center min-h-[310px]">
                <QRCode
                  value={qrPayload ?? "hello world"}
                  size={232}
                  color="black"
                  backgroundColor="white"
                />
              </View>
            </Pressable>
          </Animated.View>
        </Pressable>
        <View className="absolute bottom-safe-offset-10 w-full true-center">
          <View className="h-12 rounded-full true-center px-5 bg-white/12 self-center flex-row gap-3">
            <Feather name="camera" size={24} color="white" />
            <ThemedText
              type="bodyLg"
              weight="medium"
              className="text-white/90 dark:text-white/90"
            >
              Scan QR code
            </ThemedText>
          </View>
        </View>
      </Animated.View>
    </View>
  );
}
