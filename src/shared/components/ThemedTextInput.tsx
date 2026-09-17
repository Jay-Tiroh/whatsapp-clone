import ThemedText from "@/shared/components/ThemedText";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { forwardRef, useState } from "react";
import { TextInput, TextInputProps, View } from "react-native";
import { withUniwind } from "uniwind";

const StyledFontAwesome6 = withUniwind(FontAwesome6);

type ThemedTextInputProps = TextInputProps & {
  label?: string;
  icon?: React.ReactNode;
  error?: string;
};

const ThemedTextInput = forwardRef<TextInput, ThemedTextInputProps>(
  (
    {
      label = "",
      placeholder = "Enter text...",
      error,
      icon = (
        <StyledFontAwesome6
          name="user-large"
          size={15}
          className="text-neutral-300"
        />
      ),
      onFocus,
      onBlur,
      ...props
    },
    ref,
  ) => {
    const [isFocused, setIsFocused] = useState(false);

    return (
      <View className="gap-3">
        {label && <ThemedText weight="medium">{label}</ThemedText>}
        <View
          className={`flex-row items-center justify-between bg-surface rounded-xl px-4 py-2 min-h-13 border gap-3 ${
            error
              ? "border-red-500"
              : isFocused
                ? "border-primary ring-1 ring-primary bg-primary-50 dark:bg-neutral-800"
                : "border-divider dark:border-neutral-300"
          }`}
        >
          {icon}
          <TextInput
            ref={ref}
            className="flex-1 font-display-medium text-foreground text-body-md h-full"
            placeholderTextColorClassName="accent-neutral-300 dark:accent-neutral-200"
            onFocus={(e) => {
              setIsFocused(true);
              onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              onBlur?.(e);
            }}
            placeholder={placeholder}
            {...props}
          />
        </View>
        {error && (
          <ThemedText className="text-red-500 text-body-sm">{error}</ThemedText>
        )}
      </View>
    );
  },
);

ThemedTextInput.displayName = "ThemedTextInput";

export default ThemedTextInput;
