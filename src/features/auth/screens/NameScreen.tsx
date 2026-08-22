import AuthTemplate from "@/features/auth/components/Template";
import Spacer from "@/shared/components/Spacer";
import ThemedText from "@/shared/components/ThemedText";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { useRouter } from "expo-router";
import { useState } from "react";
import { TextInput, View } from "react-native";
import { cn } from "tailwind-variants";
import { withUniwind } from "uniwind";

const Icon = withUniwind(FontAwesome6);
export default function NameScreen() {
  const router = useRouter();
  const [isFocused, setIsFocused] = useState(false);
  return (
    <AuthTemplate
      goBack
      title="What's your name?"
      description="Write your name. You can change it back in settings."
      buttonProps={{
        onPress: () => router.navigate("/upload"),
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
        <View
          className={cn(
            "flex-row items-center justify-between bg-surface rounded-xl px-4 py-2 min-h-13 border",
            isFocused
              ? "border-primary ring-1 ring-primary bg-primary-50 dark:bg-neutral-800"
              : "border-border",
          )}
        >
          <Icon
            name="user-large"
            size={14}
            colorClassName={isFocused ? "accent-primary" : "accent-neutral-300"}
          />

          <TextInput
            className="flex-1 ml-3 text-foreground font-display-medium text-body-md h-full"
            placeholderTextColorClassName="accent-muted"
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Name"
          />
        </View>
      </View>
    </AuthTemplate>
  );
}
