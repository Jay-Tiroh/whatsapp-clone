// components/SearchBar.tsx
import Ionicons from "@expo/vector-icons/Ionicons";
import { TextInput, TextInputProps, View } from "react-native";
import { withUniwind } from "uniwind";

const StyledIonicons = withUniwind(Ionicons);

interface SearchBarProps extends Pick<
  TextInputProps,
  "value" | "onChangeText" | "onSubmitEditing" | "returnKeyType" | "autoFocus"
> {
  placeholder?: string;
}

export default function SearchBar({
  placeholder = "Search chat, people, and messages",
  ...inputProps
}: SearchBarProps) {
  return (
    <View className="h-12 w-full rounded-xl bg-white/6 items-center gap-2 px-3 flex-row border dark:border-neutral-400 border-white/16">
      <StyledIonicons
        name="search-outline"
        size={24}
        className="text-white/90 dark:text-neutral-200"
      />
      <TextInput
        placeholder={placeholder}
        placeholderTextColorClassName="accent-white/90 dark:accent-neutral-200"
        className="text-body-lg text-white/90 flex-1"
        {...inputProps}
      />
    </View>
  );
}
