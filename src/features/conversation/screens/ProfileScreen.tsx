import { useGetConversationById } from "@/features/chats/hooks/useConversations";
import MembersList from "@/features/conversation/components/MembersList";
import QRCodeModal from "@/features/conversation/components/QRCodeModal";
import ThemedText from "@/shared/components/ThemedText";
import { showErrorToast } from "@/shared/hooks/showToast";
import { formatTime } from "@/shared/utils/date";
import { getErrorMessage } from "@/shared/utils/errors";
import Feather from "@expo/vector-icons/Feather";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { BlurView } from "expo-blur";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { withUniwind } from "uniwind";
// Wrap third-party components with Uniwind to enable className support
const StyledImage = withUniwind(Image);
const StyledBlurView = withUniwind(BlurView);
const StyledFeather = withUniwind(Feather);
const StyledMaterialIcons = withUniwind(MaterialIcons);
const StyledIonicons = withUniwind(Ionicons);
const ProfileDetail = () => {
  const { conversationId } = useLocalSearchParams<{
    conversationId: string;
  }>();
  console.log("conversationId", conversationId);
  const {
    data: conversation,
    error,
    isError,
  } = useGetConversationById(conversationId);

  if (isError) {
    showErrorToast({
      title: "Error fetching conversation",
      message: getErrorMessage(error) || "An unexpected error occurred.",
    });
  }
  // const isGroup = conversation?.type === "group";
  const isGroup = true;
  const router = useRouter();
  const handlePhotoPress = () => {
    router.push(`/chats/${conversationId}/shared?tab=photo`);
  };
  const handleStarPress = () => {
    router.push(`/chats/${conversationId}/shared?tab=star`);
  };
  const handleLinkPress = () => {
    router.push(`/chats/${conversationId}/shared?tab=link`);
  };

  const [isReadMore, setIsReadMore] = useState(false);
  const handleReadMorePress = () => {
    setIsReadMore((prev) => !prev);
  };

  const [modalVisible, setModalVisible] = useState(false);
  const handleDismiss = () => setModalVisible(false);
  const handleShowModal = () => setModalVisible(true);

  return (
    <>
      <ScrollView
        className="flex-1 bg-background"
        contentContainerClassName="pb-10"
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section: Image, Svg Gradient Overlay, and Top Actions */}
        <View className="relative w-full h-[328px]">
          <StyledImage
            className="absolute inset-0 w-full h-full"
            contentFit="cover"
            source={
              conversation?.otherParticipant.avatarUrl
                ? { uri: conversation?.otherParticipant.avatarUrl }
                : require("@/assets/images/avatar.png")
            }
          />

          {/* Gradient Overlay */}

          <View className="absolute inset-0 w-full h-full bg-linear-[to_bottom,rgba(0,0,0,0.04)_0%,rgba(0,0,0,0.04)_50%,rgba(0,0,0,0.56)_100%]" />
          {/* Top Bar Actions (Maintained as dark for image contrast) */}
          <View className="absolute top-12 w-full px-4 flex-row justify-between items-start">
            <View className="w-10 h-10 rounded-full overflow-hidden items-center justify-center ">
              <StyledBlurView
                className="absolute inset-0 bg-black/64"
                intensity={40}
                tint="dark"
              />
              <StyledFeather
                name="chevron-left"
                size={24}
                className="text-white/90 z-99"
              />
            </View>

            <View className="flex-row gap-4">
              <View className="w-10 h-10 rounded-full overflow-hidden items-center justify-center">
                <StyledBlurView
                  className="absolute inset-0 bg-black/64"
                  intensity={40}
                  tint="dark"
                />
                <StyledMaterialIcons
                  name="search"
                  size={24}
                  className="text-white/90 z-99"
                />
              </View>
              <Pressable
                onPress={handleShowModal}
                className="w-10 h-10 rounded-full overflow-hidden items-center justify-center"
              >
                <StyledBlurView
                  className="absolute inset-0 bg-black/64"
                  intensity={40}
                  tint="dark"
                />
                <StyledMaterialIcons
                  name="qr-code"
                  size={24}
                  className="text-white/90 z-99"
                />
              </Pressable>
            </View>
          </View>

          {/* Profile Identity (Maintained as inverse for image contrast) */}
          <View className="absolute bottom-6 left-6 w-3/4">
            <ThemedText type="h2" className="text-white/90">
              {conversation?.otherParticipant?.displayName ?? "Unknown user"}
            </ThemedText>
            {!isGroup && (
              <ThemedText
                type="bodyLg"
                className="opacity-90 mt-1 text-white/90"
              >
                last seen {formatTime(conversation?.lastActivityAt ?? "")}
              </ThemedText>
            )}
          </View>

          {/* Floating Action Button */}
          {!isGroup && (
            <View className="absolute -bottom-10 right-6 w-20 h-20 bg-primary rounded-full items-center justify-center shadow-lg shadow-black/20">
              <StyledIonicons
                name="chatbubble-ellipses"
                size={40}
                className="text-white/90"
              />
            </View>
          )}
        </View>

        {/* Details Section */}
        {isGroup ? (
          <View className="px-6 py-6 gap-6">
            <View className="gap-1">
              <ThemedText type="bodyXl" weight="bold" color="option">
                Description🔥
              </ThemedText>
              <ThemedText
                type="bodyLg"
                color="muted"
                numberOfLines={isReadMore ? undefined : 3}
                ellipsizeMode="tail"
              >
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Sint
                autem minima perspiciatis similique? Velit repudiandae quia ad
                nam rerum laudantium assumenda? Illo neque aperiam voluptatibus
                officiis ratione earum atque rerum!
              </ThemedText>
              <ThemedText
                type="bodyLg"
                color="primary"
                weight="medium"
                onPress={handleReadMorePress}
              >
                Read {isReadMore ? "less" : "more"}
              </ThemedText>
            </View>
          </View>
        ) : (
          <View className="px-6 pt-12 pb-6 gap-6">
            <View className="gap-1">
              <ThemedText type="bodyXl" weight="bold">
                +61-123-753-555
              </ThemedText>
              <ThemedText type="bodyLg" color="muted">
                Phone number
              </ThemedText>
            </View>

            <View className="gap-1">
              <ThemedText type="bodyXl" weight="bold">
                Busy🔥
              </ThemedText>
              <ThemedText type="bodyLg" color="muted">
                Description
              </ThemedText>
            </View>
          </View>
        )}
        {/* Divider */}
        <View className="h-2 w-full bg-border my-4" />
        {/* About & First Menu Group */}
        <View className="px-3 gap-2">
          {!isGroup && (
            <View className="px-3 py-2">
              <ThemedText type="bodyXl" weight="bold">
                About
              </ThemedText>
            </View>
          )}

          <View className="flex-row items-center p-3 w-full gap-3">
            <StyledIonicons
              name="image-outline"
              size={24}
              className="text-primary-400"
            />
            <ThemedText
              type="bodyLg"
              weight="medium"
              className="flex-1"
              color="option"
            >
              2238 photos
            </ThemedText>
            <Pressable
              onPress={handlePhotoPress}
              hitSlop={20}
              className="active:opacity-75"
            >
              <StyledFeather
                name="chevron-right"
                size={24}
                className="text-neutral-300"
              />
            </Pressable>
          </View>

          {/* Horizontal Image Scroll */}

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="py-2 w-full"
            contentContainerClassName="flex-row gap-3 pl-3"
          >
            {[1, 2, 3, 4, 5, 6, 7, 8].map((image) => (
              <StyledImage
                key={image}
                source={require("@/assets/images/jethro.jpg")}
                className="size-16 rounded-2xl bg-border"
                contentFit="cover"
              />
            ))}
          </ScrollView>
        </View>

        {/* Second Menu Group */}
        <View className="px-3 gap-2">
          <View className="flex-row items-center  p-3  w-full gap-3">
            <StyledIonicons
              name="star-outline"
              size={24}
              className="text-primary-400"
            />
            <ThemedText
              type="bodyLg"
              weight="medium"
              className="flex-1"
              color="option"
            >
              43 star message
            </ThemedText>
            <Pressable
              onPress={handleStarPress}
              hitSlop={20}
              className="active:opacity-75"
            >
              <StyledFeather
                name="chevron-right"
                size={24}
                className="text-neutral-300"
              />
            </Pressable>
          </View>

          <View className="flex-row items-center  p-3  w-full gap-3">
            <StyledFeather name="link" size={24} className="text-primary-400" />
            <ThemedText
              type="bodyLg"
              weight="medium"
              className="flex-1"
              color="option"
            >
              19 shared links
            </ThemedText>
            <Pressable
              onPress={handleLinkPress}
              hitSlop={20}
              className="active:opacity-75"
            >
              <StyledFeather
                name="chevron-right"
                size={24}
                className="text-neutral-300"
              />
            </Pressable>
          </View>
        </View>

        {/* Settings Menu Group */}
        <View className="px-3 gap-2">
          <View className="flex-row items-center  p-3  w-full gap-3">
            <StyledFeather name="bell" size={24} className="text-primary-400" />
            <ThemedText
              type="bodyLg"
              weight="medium"
              className="flex-1"
              color="option"
            >
              Notifications
            </ThemedText>

            {/* Custom Designed Switch */}
            <View className="w-10 h-6 bg-primary rounded-full justify-center px-0.5 relative">
              <View className="w-5 h-5 bg-white rounded-full items-center justify-center absolute right-0.5">
                <StyledImage className="w-2 h-2" contentFit="cover" />
              </View>
            </View>
          </View>
        </View>
        {isGroup && (
          <>
            {/* Divider */}
            <View className="h-2 w-full bg-border my-4" />
            <MembersList />
          </>
        )}
        {/* Divider */}
        <View className="h-2 w-full bg-border my-4" />
        {isGroup ? (
          <View className="flex-row items-center  p-3 px-6 w-full gap-3">
            <StyledMaterialIcons
              name="logout"
              size={24}
              className="text-danger"
            />
            <ThemedText
              type="bodyLg"
              weight="medium"
              color="danger"
              className="flex-1"
            >
              Exit group
            </ThemedText>
          </View>
        ) : (
          <View className="flex-row items-center  p-3 px-6 w-full gap-3">
            <StyledMaterialIcons
              name="block-flipped"
              size={24}
              className="text-danger"
            />
            <ThemedText
              type="bodyLg"
              weight="medium"
              color="danger"
              className="flex-1"
            >
              Block contact
            </ThemedText>
          </View>
        )}
      </ScrollView>
      <QRCodeModal
        modalVisible={modalVisible}
        onDismiss={handleDismiss}
        isGroup={isGroup}
        name={conversation?.otherParticipant.displayName as string}
        avatarUrl={conversation?.otherParticipant.avatarUrl as string}
      />
    </>
  );
};

export default ProfileDetail;
