import ThemedText from "@/shared/components/ThemedText";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { useState } from "react";
import { TextInput, View } from "react-native";
import { withUniwind } from "uniwind";

const StyledFontAwesome6 = withUniwind(FontAwesome6);
export default function ThemedTextInput({
  label = "",
  placeholder = "Enter text...",
  icon = (
    <StyledFontAwesome6
      name="user-large"
      size={15}
      className="text-neutral-300"
    />
  ),
  ...props
}) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View className="gap-3">
      {label && <ThemedText weight="medium">{label}</ThemedText>}
      <View
        className={`flex-row items-center justify-between bg-surface rounded-xl px-4 py-2 min-h-13 border gap-3 ${
          isFocused
            ? "border-primary ring-1 ring-primary bg-primary-50 dark:bg-neutral-800"
            : "border-divider dark:border-neutral-300"
        }`}
      >
        {icon}
        <TextInput
          className="flex-1 font-display-medium text-foreground text-body-md h-full"
          placeholderTextColorClassName="accent-neutral-300 dark:accent-neutral-200"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          {...props}
        />
      </View>
    </View>
  );
}
