import { useLogout } from "@/features/auth";
import { useGetProfile } from "@/features/profile";
import ActionModal from "@/shared/components/ActionModal";
import ThemedText from "@/shared/components/ThemedText";
import { showErrorToast } from "@/shared/hooks/showToast";
import { getErrorMessage } from "@/shared/utils/errors";
import Feather from "@expo/vector-icons/Feather";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React, { ComponentProps, useState } from "react";
import {
  Pressable,
  RefreshControl,
  ScrollView,
  Switch,
  View,
} from "react-native";
import { withUniwind } from "uniwind";

const StyledIcon = withUniwind(FontAwesome6);
const StyledMaterial = withUniwind(MaterialCommunityIcons);
const StyledFeather = withUniwind(Feather);

const StyledFontAwesome5 = withUniwind(FontAwesome5);
const StyledImage = withUniwind(Image);

type FAName = ComponentProps<typeof StyledIcon>["name"];
type MaterialName = ComponentProps<typeof StyledMaterial>["name"];
type FeatherName = ComponentProps<typeof StyledFeather>["name"];

type IconProps =
  | { iconType: "fontawesome"; icon: FAName }
  | { iconType: "material"; icon: MaterialName }
  | { iconType: "feather"; icon: FeatherName };

interface SettingsItemProps {
  icon: FAName | MaterialName | FeatherName;
  label: string;
  rightElement?: React.ReactNode;
  hideChevron?: boolean;
  onPress?: () => void;
  iconType?: "fontawesome" | "material" | "feather";
}

const SettingsItem = ({
  icon,
  label,
  rightElement,
  hideChevron,
  onPress,
  iconType = "fontawesome",
}: SettingsItemProps) => {
  const Icon =
    iconType === "fontawesome" ? (
      <StyledIcon name={icon} size={16} className="text-primary" />
    ) : iconType === "material" ? (
      <StyledMaterial name={icon} size={16} className="text-primary" />
    ) : (
      <StyledFeather name={icon} size={16} className="text-primary" />
    );
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center gap-4 py-3 mb-2 active:opacity-70"
    >
      <View className="size-8 rounded-full dark:bg-surface bg-primary-50 items-center justify-center">
        {Icon}
      </View>
      <ThemedText
        type="bodyLg"
        weight="medium"
        color="label"
        className="flex-1"
      >
        {label}
      </ThemedText>
      {rightElement ? (
        rightElement
      ) : !hideChevron ? (
        <StyledIcon
          name="chevron-right"
          size={16}
          className="text-neutral-200 dark:text-neutral-300"
        />
      ) : null}
    </Pressable>
  );
};

type ActionConfigType = {
  for: string;
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
};

export default function SettingsScreen() {
  const {
    mutate: logout,
    isError: isLogoutError,
    error: logoutError,
  } = useLogout();

  if (isLogoutError) {
    showErrorToast({
      title: "Error logging out",
      message:
        getErrorMessage(logoutError) ??
        "An unknown error occurred while logging out.",
    });
  }

  const ActionConfig: ActionConfigType[] = [
    {
      for: "logout",
      title: "Logout",
      message: "Are you sure you want to logout?",
      primaryBtnText: "Logout",
      secondaryBtnText: "Cancel",
      primaryBtnVariant: "danger",
      onPrimaryPress: () => logout(),
      onSecondaryPress: () => {
        console.log("Cancel pressed");
      },
    },
  ];

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [actionConfig, setActionConfig] = useState<ActionConfigType | null>(
    null,
  );
  const handleLogoutPress = () => {
    setActionConfig(
      ActionConfig.find((config) => config.for === "logout") || null,
    );
    setActionModalVisible(true);
  };

  const handleActionModalDismiss = () => {
    setActionModalVisible(false);
    setActionConfig(null);
  };

  const router = useRouter();

  const toProfile = () => {
    router.push("/(tabs)/settings/edit-profile");
  };

  const profile = useGetProfile();

  return (
    <>
      <ScrollView
        className="flex-1 bg-background"
        contentContainerClassName="pt-safe-offset-10 pb-safe-offset-2 px-6"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={profile.isLoading}
            onRefresh={profile.refetch}
          />
        }
      >
        {/* Header */}
        <View className="flex-row items-center justify-between mb-8">
          <ThemedText type="h3">Settings</ThemedText>
          <Pressable className="active:opacity-70 p-2 -mr-2">
            <StyledIcon
              name="pen-to-square"
              size={24}
              className="text-primary"
            />
          </Pressable>
        </View>

        {/* Profile Section */}
        <View className="flex-row items-center gap-4 mb-8">
          <Pressable onPress={toProfile}>
            {profile?.data?.avatarUrl ? (
              <StyledImage
                source={{ uri: profile?.data?.avatarUrl }}
                className="size-16 rounded-full"
                contentFit="cover"
                cachePolicy="memory-disk"
              />
            ) : (
              <StyledFontAwesome5
                name="user-alt"
                size={87}
                className="text-white/90"
              />
            )}
          </Pressable>
          <Pressable
            onPress={toProfile}
            className="flex-1 justify-center gap-1 active:opacity-70"
          >
            <ThemedText type="h4" numberOfLines={1} ellipsizeMode="tail">
              {profile?.data?.displayName || "User Name"}
            </ThemedText>
            <ThemedText
              type="bodyLg"
              color="option"
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {profile?.data?.phoneNumber || "Phone Number"}
            </ThemedText>
          </Pressable>
          <Pressable className="active:opacity-70 p-2 ">
            <StyledMaterial name="qrcode" size={32} className="text-primary" />
          </Pressable>
        </View>

        <View className="h-px dark:bg-neutral-600 bg-divider w-full mb-6" />

        {/* Group 1 */}
        <SettingsItem icon="star" label="Star messages" />
        <SettingsItem iconType="feather" icon="phone" label="Last call" />
        <SettingsItem icon="folder" label="My folder" />
        <SettingsItem icon="circle-half-stroke" label="Appearance" />
        <SettingsItem
          icon="bell"
          label="Notification"
          rightElement={
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ true: "#57b77d", false: "#1f3c51" }}
            />
          }
        />

        <View className="h-px dark:bg-neutral-600 bg-divider w-full mb-6" />

        {/* Group 2 */}
        <SettingsItem iconType="feather" icon="lock" label="Privacy" />
        <SettingsItem
          iconType="feather"
          icon="database"
          label="Data and storage"
        />
        <SettingsItem icon="circle-question" label="FAQ" />
        <SettingsItem
          icon="right-from-bracket"
          label="Logout"
          hideChevron
          onPress={handleLogoutPress}
        />

        {/* Footer */}
        <View className="items-center mt-12 pb-8">
          <ThemedText type="bodySm" color="muted">
            2026 ChatMe • Ver 1.0
          </ThemedText>
        </View>
      </ScrollView>

      <ActionModal
        modalVisible={actionModalVisible}
        onDismiss={handleActionModalDismiss}
        title={actionConfig?.title as string}
        message={actionConfig?.message as string}
        primaryBtnText={actionConfig?.primaryBtnText as string}
        primaryBtnVariant={actionConfig?.primaryBtnVariant}
        onPrimaryPress={actionConfig?.onPrimaryPress as () => void}
        onSecondaryPress={handleActionModalDismiss}
      />
    </>
  );
}
