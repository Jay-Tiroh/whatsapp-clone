// @/shared/components/AuthTemplate.tsx
import Spacer from "@/shared/components/Spacer";
import ThemedButton from "@/shared/components/ThemedButton";
import Feather from "@expo/vector-icons/Feather";
import { useRouter } from "expo-router";
import { ComponentProps, ReactNode } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  View,
} from "react-native";
import { withUniwind } from "uniwind";

const StyledFeather = withUniwind(Feather);

type AuthTemplateProps = {
  title: ReactNode;
  description?: ReactNode;
  goBack?: boolean;
  onBack?: () => void;
  children?: ReactNode;
  buttonProps?: Omit<ComponentProps<typeof ThemedButton>, "label">;
};

const AuthTemplate = ({
  title,
  description,
  goBack = false,
  onBack,
  children,
  buttonProps,
}: AuthTemplateProps) => {
  const router = useRouter();
  const handleBack = onBack ?? (() => router.back());

  return (
    <View className="p-safe-offset-4 flex-1 gap-6">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        {goBack ? (
          <Pressable
            onPress={handleBack}
            hitSlop={8}
            className="size-10 rounded-xl border-2 border-border flex items-center justify-center"
          >
            <StyledFeather
              name="chevron-left"
              size={24}
              colorClassName="accent-neutral-900 dark:accent-white/90"
            />
          </Pressable>
        ) : (
          <Spacer size={40} />
        )}

        <View className="max-w-82 gap-1">
          {typeof title === "string" ? (
            <Text className="text-h3 font-display-bold text-neutral-900 dark:text-white/90">
              {title}
            </Text>
          ) : (
            title
          )}
          {description ? (
            typeof description === "string" ? (
              <Text className="text-body-md font-display-regular text-neutral-300 dark:text-neutral-200 mt-2">
                {description}
              </Text>
            ) : (
              description
            )
          ) : null}
        </View>

        <View className="flex-1">{children}</View>
        <View className="justify-end">
          <ThemedButton label="Next" variant="primary" {...buttonProps} />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

export default AuthTemplate;
