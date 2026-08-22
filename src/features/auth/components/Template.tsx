// @/shared/components/AuthTemplate.tsx
import ChatLayoutWrapper from "@/shared/components/ChatLayoutWrapper";
import Spacer from "@/shared/components/Spacer";
import ThemedButton from "@/shared/components/ThemedButton";
import ThemedText from "@/shared/components/ThemedText";
import Feather from "@expo/vector-icons/Feather";
import { useRouter } from "expo-router";
import { ComponentProps, ReactNode } from "react";
import { Pressable, View } from "react-native";
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
    <ChatLayoutWrapper
      bottomInput={
        <View className="px-safe-offset-6 pb-4 ">
          <ThemedButton label="Next" variant="primary" {...buttonProps} />
        </View>
      }
    >
      <View className="p-safe-offset-6 gap-6 flex-1">
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

        <View className="max-w-96 gap-1">
          {typeof title === "string" ? (
            <ThemedText type="h3">{title}</ThemedText>
          ) : (
            title
          )}
          {description ? (
            typeof description === "string" ? (
              <ThemedText type="bodyMd" color="muted" className="mt-2">
                {description}
              </ThemedText>
            ) : (
              description
            )
          ) : null}
        </View>

        {children}
      </View>
    </ChatLayoutWrapper>
  );
};

export default AuthTemplate;
