import ThemedText from "@/shared/components/ThemedText";
import { Image } from "expo-image";
import { View } from "react-native";
import { withUniwind } from "uniwind";
import type { ContactMatch } from "../types/discovery.types";

const StyledImage = withUniwind(Image);

interface ChatListEmptyProps {
  matches: ContactMatch[];
}

export default function ChatListEmpty({ matches }: ChatListEmptyProps) {
  const visible = matches.slice(0, 3);
  const remaining = matches.length - visible.length;

  const names = visible.map((m) => m.user.displayName ?? "Unknown").join(", ");

  return (
    <View className="flex-1 p-safe-offset-6 w-full">
      <View className="flex-1 items-center justify-center w-full max-w-82 m-auto">
        <View className="flex-row items-center w-full justify-center mb-4 ">
          {visible.map((match) => (
            <View
              key={match.user.id}
              className="size-14 rounded-full bg-surface -ml-6 border border-border justify-center items-center overflow-hidden"
            >
              <Image
                source={
                  match.user.avatarUrl
                    ? { uri: match.user.avatarUrl }
                    : require("@/assets/images/avatar.png")
                }
                className="w-full h-full rounded-full"
                cachePolicy="memory-disk"
                transition={200}
              />
            </View>
          ))}
          {remaining > 0 && (
            <View className="size-14 rounded-full bg-surface -ml-6 border border-border justify-center items-center">
              <ThemedText type="h6" className="text-neutral-400 ">
                {remaining}+
              </ThemedText>
            </View>
          )}
        </View>
        <ThemedText type="bodyMd" color="muted" className="text-center ">
          <ThemedText weight="medium">{names}</ThemedText> and {remaining}+
          contacts found on Chatme, try sending a message to them or just saying
          hello.
        </ThemedText>
      </View>
    </View>
  );
}
