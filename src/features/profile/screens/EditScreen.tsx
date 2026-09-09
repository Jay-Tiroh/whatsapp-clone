import { uploadToCloudinary } from "@/core/lib/cloudinary";
import UploadModal from "@/features/auth/components/UploadModal";
import {
  useGetProfile,
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

export default function EditScreen() {
  const router = useRouter();
  const profile = useGetProfile();
  const {
    mutate: updateProfile,
    isSuccess,
    isError,
    isPending,
  } = useUpdateProfile();

  const [avatarUrl, setAvatarUrl] = useState(profile?.data?.avatarUrl || "");
  const [modalVisible, setModalVisible] = useState(false);
  const [uploading, setUploading] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EditProfileFormValues>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: { name: "", phone: "" },
    mode: "onBlur",
  });

  // Seed the form once profile data resolves
  useEffect(() => {
    if (profile?.data) {
      reset({
        name: profile.data.displayName || "",
      });
      setAvatarUrl(profile.data.avatarUrl || "");
    }
  }, [profile?.data, reset]);

  const handleImageSelected = async (localUri: string) => {
    setUploading(true);
    try {
      const { secure_url } = await uploadToCloudinary(localUri, "image");
      setAvatarUrl(secure_url);
    } catch (err) {
      logger.warn("Image upload failed", getErrorMessage(err));
      showWarningToast({
        title: "Image upload failed",
        message: "Please try again.",
      });
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = (values: EditProfileFormValues) => {
    updateProfile({
      displayName: values.name,
      avatarUrl,
    });
  };

  if (isSuccess) {
    showSuccessToast({
      title: "Profile updated",
      message: "Your profile has been updated successfully.",
    });
  }

  if (isError) {
    showWarningToast({
      title: "Profile update failed",
      message:
        "An error occurred while updating your profile. Please try again.",
    });
  }

  const Header = () => {
    return (
      <View className="h-45.5 py-6 pt-safe-offset-6 bg-primary-400 dark:bg-neutral-700 relative w-full">
        <View className="flex-row true-center px-6 relative">
          <Pressable
            className="active:opacity-70 absolute left-6"
            onPress={() => router.back()}
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
            onPress={() => setModalVisible((prev) => !prev)}
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
  };

  return (
    <View className="w-full flex-1 pb-safe-offset-6 bg-background">
      <Header />
      <Spacer size={98} />
      <View className="flex-1">
        <View className="p-6 gap-6">
          <FormTextInput
            control={control}
            name="name"
            label="Name"
            placeholder="Name"
          />

          <View className="gap-3 opacity-50 pointer-events-none">
            <ThemedText weight="medium">Phone Number</ThemedText>

            <CountryPicker
              showDialCode={true}
              showPhoneInput={true}
              value={profile?.data?.phoneNumber || ""}
              // onChangeText={onChange}
              error={errors.phone?.message}
              disabled={true}
            />
          </View>
        </View>
      </View>
      <View className="px-6">
        <ThemedButton
          label={isPending ? "Saving..." : "Save"}
          onPress={handleSubmit(onSubmit)}
          disabled={isPending}
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
