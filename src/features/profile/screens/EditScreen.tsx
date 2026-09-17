import UploadModal from "@/features/auth/components/UploadModal";
import { useUpload } from "@/features/media/hooks/useUpload";
import {
  useGetProfile,
  useSetAvatar,
  useUpdateProfile,
} from "@/features/profile/hooks/useProfile";
import {
  EditProfileFormValues,
  editProfileSchema,
} from "@/features/profile/validation/profile.schema";
import { CountryPicker } from "@/shared/components/CountryPicker";
import { FormTextInput } from "@/shared/components/FormTextInput";
import Spacer from "@/shared/components/Spacer";
import ThemedButton from "@/shared/components/ThemedButton";
import ThemedText from "@/shared/components/ThemedText";
import { showSuccessToast, showWarningToast } from "@/shared/hooks/showToast";
import { getErrorMessage } from "@/shared/utils/errors";
import { logger } from "@/shared/utils/logger";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { zodResolver } from "@hookform/resolvers/zod";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { ActivityIndicator, Pressable, View } from "react-native";
import { withUniwind } from "uniwind";

const StyledIonicons = withUniwind(Ionicons);
const StyledFontAwesome5 = withUniwind(FontAwesome5);
const StyledImage = withUniwind(Image);
const StyledMaterialCommunityIcons = withUniwind(MaterialCommunityIcons);

// Hoisted out of EditScreen so it isn't recreated (and remounted) every render.
function Header({
  avatarUrl,
  uploading,
  onBack,
  onPickAvatar,
}: {
  avatarUrl: string;
  uploading: boolean;
  onBack: () => void;
  onPickAvatar: () => void;
}) {
  return (
    <View className="h-45.5 py-6 pt-safe-offset-6 bg-primary-400 dark:bg-neutral-700 relative w-full">
      <View className="flex-row true-center px-6 relative">
        <Pressable
          className="active:opacity-70 absolute left-6"
          onPress={onBack}
          hitSlop={20}
        >
          <StyledIonicons
            name="chevron-back"
            size={24}
            className="text-white/90"
          />
        </Pressable>
      </View>

      <View className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 border-2 border-background rounded-full true-center size-37 bg-neutral-100">
        {avatarUrl ? (
          <StyledImage
            source={{ uri: avatarUrl }}
            className="w-full h-full rounded-full"
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
        {uploading && (
          <View className="bg-black/12 w-full h-full absolute top-0 true-center">
            <ActivityIndicator size={40} />
          </View>
        )}
        <Pressable
          onPress={onPickAvatar}
          className="size-10 rounded-full true-center bg-primary-400 absolute bottom-0 right-0"
        >
          <StyledMaterialCommunityIcons
            name="camera-plus"
            size={20}
            className="text-white/90"
          />
        </Pressable>
      </View>
    </View>
  );
}

export default function EditScreen() {
  const router = useRouter();
  const profile = useGetProfile();

  const {
    mutate: updateProfile,
    isSuccess: isProfileUpdateSuccess,
    isError: isProfileUpdateError,
    isPending: isProfileUpdatePending,
    reset: resetUpdateProfile,
  } = useUpdateProfile();

  const {
    mutate: setAvatar,
    isPending: isAvatarPending,
    isError: isAvatarError,
    reset: resetSetAvatar,
  } = useSetAvatar();

  const [avatarUrl, setAvatarUrl] = useState(profile?.data?.avatarUrl || "");
  const [modalVisible, setModalVisible] = useState(false);
  const { upload, status } = useUpload();
  const uploading =
    status === "preparing" ||
    status === "requesting" ||
    status === "uploading" ||
    status === "completing" ||
    isAvatarPending;

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EditProfileFormValues>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: { displayName: "" },
    mode: "onBlur",
  });

  // Seed the form once profile data resolves
  useEffect(() => {
    if (profile?.data) {
      reset({
        displayName: profile.data.displayName || "",
      });
      setAvatarUrl(profile.data.avatarUrl || "");
    }
  }, [profile?.data, reset]);

  // Avatar is its own resource (PUT /v1/me/avatar) — save it as soon as
  // the upload finishes, rather than bundling it into the name-save.
  const handleImageSelected = async (localUri: string) => {
    try {
      const media = await upload({ uri: localUri, purpose: "profile_avatar" });
      setAvatar(
        { mediaId: media.id },
        {
          onSuccess: (data) => {
            setAvatarUrl(data.avatarUrl || "");
            showSuccessToast({
              title: "Avatar updated",
              message: "Your profile photo has been updated.",
            });
          },
          onError: (err) => {
            logger.warn("Avatar update failed", getErrorMessage(err));
            showWarningToast({
              title: "Avatar update failed",
              message: "Please try again.",
            });
          },
        },
      );
    } catch (err) {
      logger.warn("Image upload failed", getErrorMessage(err));
      showWarningToast({
        title: "Image upload failed",
        message: "Please try again.",
      });
    }
  };

  // Only the name goes through the profile-update mutation now.
  const onSubmit = (values: EditProfileFormValues) => {
    updateProfile(
      { displayName: values.displayName },
      {
        onSuccess: () => {
          showSuccessToast({
            title: "Profile updated",
            message: "Your profile has been updated successfully.",
          });
        },
        onError: () => {
          showWarningToast({
            title: "Profile update failed",
            message:
              "An error occurred while updating your profile. Please try again.",
          });
        },
      },
    );
  };

  return (
    <View className="w-full flex-1 pb-safe-offset-6 bg-background">
      <Header
        avatarUrl={avatarUrl}
        uploading={uploading}
        onBack={() => router.back()}
        onPickAvatar={() => setModalVisible((prev) => !prev)}
      />
      <Spacer size={98} />
      <View className="flex-1">
        <View className="p-6 gap-6">
          <FormTextInput
            control={control}
            name="displayName"
            label="Name"
            placeholder="Name"
          />

          <View className="gap-3 opacity-50 pointer-events-none">
            <ThemedText weight="medium">Phone Number</ThemedText>

            <CountryPicker
              showDialCode={true}
              showPhoneInput={true}
              value={profile?.data?.phoneNumber || ""}
              disabled={true}
            />
          </View>
        </View>
      </View>
      <View className="px-6">
        <ThemedButton
          label={isProfileUpdatePending ? "Saving..." : "Save"}
          onPress={handleSubmit(onSubmit)}
          disabled={isProfileUpdatePending}
        />
      </View>

      <UploadModal
        modalVisible={modalVisible}
        setModalVisible={setModalVisible}
        onImageSelected={handleImageSelected}
      />
    </View>
  );
}
