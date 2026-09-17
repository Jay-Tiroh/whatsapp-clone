import AppIcon from "@/assets/icons/logo-icon.svg";
import Bg from "@/assets/images/bg.svg";
import { useAppearance } from "@/core/store/appearanceStore";
import ThemedText from "@/shared/components/ThemedText";
import { AccentColor, THEMES } from "@/shared/constants/accentThemes";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { useState } from "react";
import {
  Appearance,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  View,
} from "react-native";
import { withUniwind } from "uniwind";

const StyledBg = withUniwind(Bg);
const StyledIcon = withUniwind(FontAwesome6);
const StyledAppIcon = withUniwind(AppIcon);
type ThemeColors = "green" | "blue" | "red" | "orange";

// const THEMES = [
//   {
//     id: "green",
//     name: "Green",
//     colorClass: "bg-green-400",
//     textClass: "text-green-400",
//   },
//   {
//     id: "blue",
//     name: "Blue",
//     colorClass: "bg-blue-400",
//     textClass: "text-blue-400",
//   },
//   {
//     id: "red",
//     name: "Red",
//     colorClass: "bg-red-400",
//     textClass: "text-red-400",
//   },
//   {
//     id: "orange",
//     name: "Orange",
//     colorClass: "bg-orange-400",
//     textClass: "text-orange-400",
//   },
// ];

export default function AppearanceScreen() {
  const [isNightMode, setIsNightMode] = useState(true);
  const [isLargeEmoji, setIsLargeEmoji] = useState(false);

  const handleNightModeToggle = () => {
    const next = !isNightMode;
    setIsNightMode(next);
    Appearance.setColorScheme(next ? "dark" : "unspecified");
  };

  const { accentColor, setAccentColor } = useAppearance();

  const handleThemeChange = (themeId: AccentColor) => {
    setAccentColor(themeId);
  };
  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center px-4 pt-safe-offset-4 pb-4 bg-primary-400 dark:bg-background z-10">
        <Pressable className="p-2 active:opacity-80">
          <StyledIcon name="chevron-left" size={20} className="text-white/90" />
        </Pressable>
        <View className="flex-1 items-center pr-8">
          <ThemedText type="h4" className="text-white/90">
            Appearance
          </ThemedText>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Chat Preview Area */}
        <View className="relative w-full h-[220px] overflow-hidden">
          <StyledBg
            className="absolute top-0 left-0 right-0 bottom-0 flex-1 w-full h-full text-primary-100 bg-primary-50/80 dark:bg-neutral-800 dark:text-neutral-700"
            style={StyleSheet.absoluteFill}
            preserveAspectRatio="xMidYMid slice"
          />
          <View className="flex-1 justify-center px-4 py-6 gap-6">
            <View className="flex-row items-end gap-2">
              <View className="max-w-[75%] rounded-2xl rounded-bl-sm bg-surface px-4 py-3 shadow-sm shadow-neutral-900/5">
                <ThemedText type="bodyLg">
                  Habitant elit pellentesque curabitur morbi sit fusce elit
                </ThemedText>
              </View>
              <ThemedText type="bodySm" color="muted">
                18:25
              </ThemedText>
            </View>

            <View className="flex-row justify-end items-end gap-2">
              <ThemedText type="bodySm" color="muted">
                19:40
              </ThemedText>
              <View className="max-w-[75%] rounded-2xl rounded-br-sm bg-primary px-4 py-3 shadow-sm shadow-neutral-900/5">
                <ThemedText type="bodyLg" color="inverse">
                  Gravida lectus semper orci
                </ThemedText>
              </View>
            </View>
          </View>
        </View>

        {/* Settings Container */}
        <View className="px-6 py-6 gap-8">
          {/* Theme Selector */}
          <View className="gap-4">
            <ThemedText type="h5" color="muted">
              Select a Theme
            </ThemedText>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerClassName="flex-row gap-4 pr-2"
            >
              {THEMES.map((theme) => {
                const isActive = accentColor === theme.id;
                return (
                  <Pressable
                    key={theme.id}
                    onPress={() => handleThemeChange(theme.id as ThemeColors)}
                    className="items-center gap-2 active:opacity-80 relative"
                  >
                    <View
                      className={`relative w-[72px] h-[88px] rounded-2xl bg-surface items-center justify-center pt-2 border-2 overflow-hidden ${
                        isActive ? "border-primary" : "border-transparent"
                      }`}
                    >
                      {/* Mini chat bubbles illustration */}
                      <View className="w-full gap-2 p-2">
                        <View
                          className={`w-10 h-3 rounded-full self-end ${theme.colorClass}`}
                        />
                        <View className="w-8 h-3 rounded-full bg-neutral-100 dark:bg-neutral-800 self-start" />
                      </View>

                      {/* Theme Label */}
                      <View
                        className={` w-full rounded-b-xl py-1.5 items-center ${isActive ? theme.colorClass : "bg-transparent"}`}
                      >
                        <ThemedText
                          type="bodySm"
                          className={isActive ? "text-white" : theme.textClass}
                        >
                          {theme.name}
                        </ThemedText>
                      </View>
                    </View>
                    {/* Check badge */}
                    {isActive && (
                      <View className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-primary border-2 border-background items-center justify-center z-10">
                        <StyledIcon
                          name="check"
                          size={10}
                          className="text-white"
                        />
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          {/* Toggles */}
          <View className="gap-6 rounded-2xl py-4">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-4">
                <View className="w-10 h-10 rounded-full bg-primary-50 dark:bg-neutral-800 items-center justify-center">
                  <StyledIcon name="moon" size={18} className="text-primary" />
                </View>
                <ThemedText type="bodyLg">Night Mode</ThemedText>
              </View>
              <Switch
                value={isNightMode}
                onValueChange={handleNightModeToggle}
                trackColor={{ false: "#eaeef2", true: "#1f3c51" }}
                thumbColor={"#b3c2ce"}
              />
            </View>

            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-4">
                <View className="w-10 h-10 rounded-full bg-primary-50 dark:bg-neutral-800 items-center justify-center">
                  <StyledIcon
                    name="face-smile"
                    size={18}
                    className="text-primary"
                  />
                </View>
                <ThemedText type="bodyLg">Large Emoji</ThemedText>
              </View>
              <Switch
                value={isLargeEmoji}
                onValueChange={setIsLargeEmoji}
                trackColor={{ false: "#eaeef2", true: "#1f3c51" }}
                thumbColor={"#b3c2ce"}
              />
            </View>
          </View>

          {/* App Icon Selector */}
          <View className="gap-4 pb-safe-offset-4">
            <ThemedText type="h5" color="muted">
              App Icon
            </ThemedText>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerClassName="flex-row gap-4"
            >
              {THEMES.map((theme) => (
                <View key={`icon-${theme.id}`} className="items-center gap-2">
                  <View className="w-[72px] h-[72px] rounded-2xl bg-surface items-center justify-center border border-border">
                    <StyledAppIcon className={theme.textClass} />
                  </View>
                  <ThemedText
                    type="bodySm"
                    className={`${theme.textClass} dark:${theme.textClass}`}
                  >
                    {theme.name}
                  </ThemedText>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
