// components/SearchBar.tsx
import Ionicons from "@expo/vector-icons/Ionicons";
import { TextInput, TextInputProps, View } from "react-native";
import { tv, type VariantProps } from "tailwind-variants";
import { withUniwind } from "uniwind";

const StyledIonicons = withUniwind(Ionicons);

// 1. Container Variants
const containerVariants = tv({
  base: "h-12 w-full rounded-xl bg-white/6 items-center gap-2 px-3 flex-row border dark:border-neutral-400",
  variants: {
    variant: {
      base: "border-white/16",
      sheet: "border-divider",
    },
  },
  defaultVariants: {
    variant: "base",
  },
});

// 2. Icon Variants
const iconVariants = tv({
  base: "dark:text-neutral-200",
  variants: {
    variant: {
      base: "text-white/90",
      sheet: "text-neutral-300",
    },
  },
  defaultVariants: {
    variant: "base",
  },
});

// 3. Placeholder Text Variants
const placeholderVariants = tv({
  base: "dark:accent-neutral-200",
  variants: {
    variant: {
      base: "accent-white/90",
      sheet: "accent-neutral-300",
    },
  },
  defaultVariants: {
    variant: "base",
  },
});

interface SearchBarProps
  extends
    Pick<
      TextInputProps,
      | "value"
      | "onChangeText"
      | "onSubmitEditing"
      | "returnKeyType"
      | "autoFocus"
    >,
    VariantProps<typeof containerVariants> {
  placeholder?: string;
}

export default function SearchBar({
  placeholder = "Search chat, people, and messages...",
  variant,
  ...inputProps
}: SearchBarProps) {
  return (
    <View className={containerVariants({ variant })}>
      <StyledIonicons
        name="search-outline"
        size={24}
        className={iconVariants({ variant })}
      />
      <TextInput
        placeholder={placeholder}
        placeholderTextColorClassName={placeholderVariants({ variant })}
        className="text-body-lg text-white/90 flex-1 h-full"
        {...inputProps}
        numberOfLines={1}
      />
    </View>
  );
}
