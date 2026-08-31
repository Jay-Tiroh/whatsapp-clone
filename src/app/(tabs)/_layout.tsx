// TabsLayout.tsx
import { useAuthStore } from "@/features/auth";
import PinPromptModal from "@/features/chats/components/PinPromptModal";
import { usePinPromptModal } from "@/features/chats/hooks/usePinPromptModal";
import GlobalBottomSheet from "@/shared/components/BaseBottomSheet";
import {
  TABS,
  TabBarLabelSize,
  TabBarLayout,
} from "@/shared/constants/TabsConfig";
import { Redirect, Tabs } from "expo-router";
import { getFocusedRouteNameFromRoute } from "expo-router/build/react-navigation";
import { ColorValue, Text, View, ViewStyle } from "react-native";
import Animated, {
  Easing,
  Extrapolation,
  interpolate,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SvgProps } from "react-native-svg";
import { useCSSVariable } from "uniwind";
function renderIcon(Icon: React.FC<SvgProps>, focused: boolean) {
  return (
    <Icon
      className={focused ? "text-primary" : "text-muted"}
      style={{ width: 24, height: 24 }}
      width={24}
      height={24}
    />
  );
}

export default function TabsLayout() {
  const sheetAnimatedIndex = useSharedValue(-1);
  const sheetAnimatedPosition = useSharedValue(0);
  const backgroundProgress = useSharedValue(0);
  useAnimatedReaction(
    () => sheetAnimatedIndex.value >= 0,
    (isOpen, wasOpen) => {
      if (isOpen !== wasOpen) {
        backgroundProgress.value = withTiming(isOpen ? 1 : 0, {
          duration: 300,
          easing: Easing.out(Easing.ease),
        });
      }
    },
  );

  const backgroundAnimatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      backgroundProgress.value,
      [0, 1],
      [1, 0.95],
      Extrapolation.CLAMP,
    );
    const translateY = interpolate(
      backgroundProgress.value,
      [0, 1],
      [0, -8],
      Extrapolation.CLAMP,
    );
    const borderRadius = interpolate(
      backgroundProgress.value,
      [0, 1],
      [0, 24],
      Extrapolation.CLAMP,
    );
    return {
      transform: [{ scale }, { translateY }],
      borderRadius,
    };
  });

  const insets = useSafeAreaInsets();
  const [surface, neutral300, primary400, fontMd, fontBold] = useCSSVariable([
    "--color-surface",
    "--color-neutral-300",
    "--color-primary-400",
    "--font-display-medium",
    "--font-display-bold",
  ]);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const { modalVisible, handleDismiss } = usePinPromptModal();
  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <View style={{ flex: 1 }}>
      <Animated.View
        style={[
          {
            flex: 1,
            overflow: "hidden",
            zIndex: 0, // Force to background on iOS
            elevation: 0, // Force to background on Android
          },
          backgroundAnimatedStyle,
        ]}
      >
        <Tabs
          initialRouteName="chats"
          backBehavior="initialRoute"
          screenOptions={({ route }) => {
            const focusedRoute = getFocusedRouteNameFromRoute(route) ?? "index";
            const showTabBar = focusedRoute === "index";
            return {
              tabBarStyle: showTabBar
                ? {
                    ...(TabBarLayout as ViewStyle),
                    backgroundColor: surface as string,
                    paddingBottom: insets.bottom + 10,
                  }
                : { display: "none" },
              tabBarActiveTintColor: primary400 as ColorValue,
              tabBarInactiveTintColor: neutral300 as ColorValue,
              tabBarBackground: () => null,
            };
          }}
        >
          {TABS.map((tab) => (
            <Tabs.Screen
              key={tab.name}
              name={tab.name}
              options={{
                title: tab.label,
                tabBarLabel: ({ focused, color }) => (
                  <Text
                    style={{
                      fontSize: TabBarLabelSize,
                      marginTop: 4,
                      fontFamily:
                        (focused ? (fontBold as string) : (fontMd as string)) ??
                        "System",
                      color,
                    }}
                  >
                    {tab.label}
                  </Text>
                ),
                tabBarIcon: ({ focused }) => renderIcon(tab.icon, focused),
                headerShown: false,
              }}
              listeners={({ navigation }) => ({
                tabPress: (e) => {
                  e.preventDefault();
                  navigation.navigate(tab.name, {
                    screen: tab.initialRoute ?? "index",
                  });
                },
              })}
            />
          ))}
        </Tabs>
      </Animated.View>
      <PinPromptModal modalVisible={modalVisible} onDismiss={handleDismiss} />
      <GlobalBottomSheet />
    </View>
  );
}
