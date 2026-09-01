import ChatLayoutWrapper from "@/shared/components/ChatLayoutWrapper";
import ThemedText from "@/shared/components/ThemedText";
import { logger } from "@/shared/utils/logger";
import Entypo from "@expo/vector-icons/Entypo";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { ImageBackground } from "expo-image";
import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { StyleSheet, TextInput, View } from "react-native";
import { withUniwind } from "uniwind";
import ChatHeader from "../components/ChatHeader";

const StyledFontAwesome = withUniwind(FontAwesome);
const StyledEntypo = withUniwind(Entypo);

export default function ConversationScreen() {
  const { conversationId } = useLocalSearchParams();
  logger.log("ConversationScreen params", conversationId);
  const [value, setValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const onChange = (text: string) => {
    setValue(text);
  };
  const onBlur = () => {
    // Handle blur event if needed
  };
  return (
    <ChatLayoutWrapper
      bottomInput={
        <View className="flex-row items-center px-5 h-14 bg-white max-w-10/12 mx-auto mb-safe rounded-full">
          <StyledEntypo
            name="attachment"
            size={24}
            className="text-neutral-300 dark:text-neutral-200"
          />
          <TextInput
            value={value}
            onChangeText={onChange}
            className="flex-1 ml-3 text-foreground font-display-medium text-body-md"
            placeholderTextColorClassName="accent-neutral-300 dark:accent-neutral-200"
            onFocus={() => setIsFocused(true)}
            onBlur={() => {
              setIsFocused(false);
              onBlur();
            }}
            placeholder="Write a message"
            autoCapitalize="words"
            autoCorrect
          />

          <View className=" rounded-full size-10 bg-primary-400 true-center">
            <StyledFontAwesome
              name="send"
              size={20}
              className="text-white/90"
            />
          </View>
        </View>
      }
    >
      <ImageBackground
        source={require("@/assets/images/bg.png")}
        className="flex-1 items-center bg-primary-50 dark:bg-neutral-900"
        style={StyleSheet.absoluteFill}
      >
        <ChatHeader title="John Doe" />
        <View className="flex-1">
          <ThemedText>ConversationScreen for {conversationId} </ThemedText>
        </View>
      </ImageBackground>
    </ChatLayoutWrapper>
  );
}
