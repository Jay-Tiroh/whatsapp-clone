import { useAuthStore } from "@/core/store/authStore";
import AuthTemplate from "@/features/auth/components/Template";
import {
  CompleteProfileFormValues,
  completeProfileSchema,
} from "@/features/auth/validation/auth.validation";
import { useUpdateProfile } from "@/features/profile/hooks/useProfile";
import Spacer from "@/shared/components/Spacer";
import ThemedText from "@/shared/components/ThemedText";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { TextInput, View } from "react-native";
import Toast from "react-native-toast-message";
import { cn } from "tailwind-variants";
import { withUniwind } from "uniwind";

const Icon = withUniwind(FontAwesome6);

export default function NameScreen() {
  const router = useRouter();
  const [isFocused, setIsFocused] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<CompleteProfileFormValues>({
    resolver: zodResolver(completeProfileSchema),
    defaultValues: { displayName: "" },
    mode: "onChange",
  });

  const updateProfile = useUpdateProfile();

  const onSubmit = (values: CompleteProfileFormValues) => {
    updateProfile.mutate(
      { displayName: values.displayName },
      {
        onSuccess: (updatedUser) => {
          // Keep the store in sync with the backend
          useAuthStore.getState().updateUser(updatedUser);

          // Proceed to the next step in onboarding
          // router.push("/upload");
          router.push("/chats");
        },
        onError: () => {
          Toast.show({ type: "error", text1: "Couldn't update name" });
        },
      },
    );
  };

  return (
    <AuthTemplate
      goBack
      title="What's your name?"
      description="Write your name. You can change it back in settings."
      buttonProps={{
        onPress: handleSubmit(onSubmit),
        disabled: !isValid,
        isLoading: updateProfile.isPending,
      }}
    >
      <View className="flex-1">
        <ThemedText
          type="bodyMd"
          weight="medium"
          className="px-1"
          color="label"
        >
          Name
        </ThemedText>
        <Spacer size={8} />

        <Controller
          control={control}
          name="displayName"
          render={({ field: { value, onChange, onBlur } }) => (
            <>
              <View
                className={cn(
                  "flex-row items-center justify-between bg-surface rounded-xl px-4 py-2 min-h-13 border",
                  isFocused
                    ? "border-primary ring-1 ring-primary bg-primary-50 dark:bg-neutral-800"
                    : errors.displayName
                      ? "border-danger"
                      : "border-border",
                )}
              >
                <Icon
                  name="user-large"
                  size={14}
                  colorClassName={
                    isFocused
                      ? "accent-primary"
                      : errors.displayName
                        ? "accent-danger"
                        : "accent-neutral-300"
                  }
                />

                <TextInput
                  value={value}
                  onChangeText={onChange}
                  className="flex-1 ml-3 text-foreground font-display-medium text-body-md h-full"
                  placeholderTextColorClassName="accent-muted"
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => {
                    setIsFocused(false);
                    onBlur(); // Ensure RHF gets the blur event too
                  }}
                  placeholder="Name"
                  autoCapitalize="words"
                  autoCorrect={false}
                />
              </View>

              {errors.displayName && (
                <ThemedText type="bodySm" color="danger" className="mt-1 px-1">
                  {errors.displayName.message}
                </ThemedText>
              )}
            </>
          )}
        />
      </View>
    </AuthTemplate>
  );
}
