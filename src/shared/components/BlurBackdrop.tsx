import { BottomSheetBackdropProps } from "@gorhom/bottom-sheet";
import { BlurView } from "expo-blur";
import { useMemo } from "react";
import { Platform, StyleSheet, ViewProps } from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedProps,
  useAnimatedStyle,
} from "react-native-reanimated";

const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);
const AnimatedView = Animated.View;

const BlurBackdrop = ({ animatedIndex, style }: BottomSheetBackdropProps) => {
  const containerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      animatedIndex.value,
      [-1, 0],
      [0, 1],
      Extrapolation.CLAMP,
    ),
  }));

  const containerAnimatedProps = useAnimatedProps(() => ({
    pointerEvents: (animatedIndex.value >= 0
      ? "auto"
      : "none") as ViewProps["pointerEvents"],
  }));

  const containerStyle = useMemo(
    () => [style, styles.container, containerAnimatedStyle],
    [style, containerAnimatedStyle],
  );

  if (Platform.OS === "ios") {
    return (
      <AnimatedBlurView
        style={[containerStyle, { backgroundColor: "rgba(0, 0, 0, 0.2)" }]}
        animatedProps={containerAnimatedProps}
        tint="dark"
        intensity={70}
      />
    );
  }

  return (
    <AnimatedView
      style={[containerStyle, { backgroundColor: "rgba(0, 0, 0, 0.5)" }]}
      animatedProps={containerAnimatedProps}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
  },
});

export default BlurBackdrop;
