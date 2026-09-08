import ThemedButton from "@/shared/components/ThemedButton";
import ThemedText from "@/shared/components/ThemedText";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { BlurView } from "expo-blur";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  BackHandler,
  Dimensions,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { withUniwind } from "uniwind";

const StyledFontAwesome6 = withUniwind(FontAwesome6);
const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export type ActionModalProps = {
  modalVisible: boolean;
  onDismiss: () => void;
  title: string;
  message: string;
  primaryBtnText: string;
  secondaryBtnText?: string;
  primaryBtnVariant?:
    | "primary"
    | "secondary"
    | "danger"
    | "info"
    | "warning"
    | "success"
    | "outline"
    | "elevated"
    | "tertiary";
  onPrimaryPress: () => void;
  onSecondaryPress?: () => void;
  iconName?: string;
  iconColorClassName?: string;
  /** Background tint behind the icon. Defaults to a soft version of the icon color. */
  iconBgClassName?: string;
};

export default function ActionModal({
  modalVisible,
  onDismiss,
  title,
  message,
  primaryBtnText,
  secondaryBtnText = "Cancel",
  primaryBtnVariant = "primary",
  onPrimaryPress,
  onSecondaryPress,
  iconName,
  iconColorClassName = "accent-primary-500",
  iconBgClassName = "bg-primary-100",
}: ActionModalProps) {
  const [isRendered, setIsRendered] = useState(modalVisible);
  const translateY = useRef(new Animated.Value(24)).current;
  const scale = useRef(new Animated.Value(0.92)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  const handleClose = () => onDismiss();

  useEffect(() => {
    if (modalVisible) {
      setIsRendered(true);
      translateY.setValue(24);
      scale.setValue(0.92);
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          damping: 20,
          stiffness: 220,
          mass: 0.8,
        }),
        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: true,
          damping: 20,
          stiffness: 220,
          mass: 0.8,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 160,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 0.94,
          duration: 160,
          useNativeDriver: true,
        }),
      ]).start(() => setIsRendered(false));
    }
  }, [modalVisible, backdropOpacity, translateY, scale]);

  // Replicates Modal's onRequestClose for Android hardware back button
  useEffect(() => {
    if (!isRendered || Platform.OS !== "android") return;
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      handleClose();
      return true;
    });
    return () => sub.remove();
  }, [isRendered]);

  const handlePrimary = () => {
    onPrimaryPress();
    handleClose();
  };

  const handleSecondary = () => {
    if (onSecondaryPress) {
      onSecondaryPress();
    }
    handleClose();
  };

  if (!isRendered) return null;

  return (
    <View
      style={StyleSheet.absoluteFill}
      className="z-50"
      pointerEvents="box-none"
    >
      <Animated.View
        style={[StyleSheet.absoluteFill, { opacity: backdropOpacity }]}
      >
        {Platform.OS === "ios" ? (
          <BlurView
            intensity={60}
            tint="dark"
            style={StyleSheet.absoluteFill}
          />
        ) : (
          <View
            style={[
              StyleSheet.absoluteFill,
              { backgroundColor: "rgba(0,0,0,0.55)" },
            ]}
          />
        )}
        <Pressable
          className="flex-1 justify-center items-center p-6"
          onPress={handleClose}
        >
          <Animated.View
            style={{ transform: [{ translateY }, { scale }] }}
            className="w-full max-w-80"
          >
            <Pressable className="w-full bg-surface rounded-[28px] overflow-hidden shadow-lg">
              {/* Content */}
              <View className="px-6 pt-8 pb-6 items-center gap-2">
                {iconName && (
                  <View
                    className={`size-14 rounded-full items-center justify-center mb-3 ${iconBgClassName}`}
                  >
                    <StyledFontAwesome6
                      name={iconName}
                      size={22}
                      colorClassName={iconColorClassName}
                    />
                  </View>
                )}
                <ThemedText type="h4" className="text-center">
                  {title}
                </ThemedText>
                <ThemedText
                  type="bodyMd"
                  color="muted"
                  className="text-center leading-5 px-1"
                >
                  {message}
                </ThemedText>
              </View>

              {/* Actions — stacked, full-width, primary on top */}
              <View className="px-6 pb-6 pt-1 gap-3">
                <ThemedButton
                  label={primaryBtnText}
                  variant={primaryBtnVariant}
                  onPress={handlePrimary}
                  className="w-full"
                />
                {secondaryBtnText && (
                  <ThemedButton
                    label={secondaryBtnText}
                    variant="tertiary"
                    onPress={handleSecondary}
                    className="w-full"
                  />
                )}
              </View>
            </Pressable>
          </Animated.View>
        </Pressable>
      </Animated.View>
    </View>
  );
}
