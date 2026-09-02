// components/MessageInputBar.tsx
import AntDesign from "@expo/vector-icons/AntDesign";
import Entypo from "@expo/vector-icons/Entypo";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useState } from "react";
import { Pressable, TextInput, View } from "react-native";
import { EaseView } from "react-native-ease/uniwind";
import EmojiPicker from "rn-emoji-keyboard";
import { withUniwind } from "uniwind";

const StyledAntDesign = withUniwind(AntDesign);
const StyledFontAwesome = withUniwind(FontAwesome);
const StyledEntypo = withUniwind(Entypo);

type Props = {
  onSend: (text: string) => void;
};

export default function MessageInputBar({ onSend }: Props) {
  const [value, setValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const hasText = !!value.trim();

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setValue("");
  };

  const handleMicPress = () => {};

  return (
    <View className="w-full gap-4 flex-row items-center max-w-11/12 mx-auto mb-1">
      <View
        className={`flex-row flex-1 items-center px-5 h-14 bg-white rounded-full ${
          isFocused ? "border border-primary-300" : ""
        }`}
      >
        <Pressable hitSlop={8} onPress={() => setIsPickerOpen(true)}>
          <StyledEntypo
            name="emoji-happy"
            size={24}
            className="text-neutral-300 dark:text-neutral-200"
          />
        </Pressable>

        <TextInput
          value={value}
          onChangeText={setValue}
          className="flex-1 ml-3 text-foreground font-display-medium text-body-md"
          placeholderTextColorClassName="accent-neutral-300 dark:accent-neutral-200"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onSubmitEditing={handleSend}
          placeholder="Write a message"
          autoCapitalize="sentences"
          autoCorrect
        />

        <Pressable hitSlop={8}>
          <StyledEntypo
            name="attachment"
            size={24}
            className="text-neutral-300 dark:text-neutral-200 rotate-270"
          />
        </Pressable>
      </View>

      <Pressable
        onPress={hasText ? handleSend : handleMicPress}
        className="rounded-full size-13 bg-primary-400 true-center overflow-hidden relative"
      >
        <EaseView
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            alignItems: "center",
            justifyContent: "center",
          }}
          animate={{
            opacity: hasText ? 0 : 1,
            translateX: hasText ? -30 : 0,
          }}
        >
          <StyledFontAwesome
            name="microphone"
            size={24}
            className="text-white/90"
          />
        </EaseView>

        <EaseView
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            alignItems: "center",
            justifyContent: "center",
          }}
          animate={{
            opacity: hasText ? 1 : 0,
            translateX: hasText ? 0 : 30,
          }}
        >
          <StyledAntDesign name="send" size={24} className="text-white/90" />
        </EaseView>
      </Pressable>

      <EmojiPicker
        onEmojiSelected={(emojiObject) => {
          setValue((prev) => prev + emojiObject.emoji);
        }}
        open={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
      />
    </View>
  );
}
