import ThemedText from "@/shared/components/ThemedText";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { useRouter } from "expo-router";
import { Pressable, View } from "react-native";
import { withUniwind } from "uniwind";

const StyledFontAwesome6 = withUniwind(FontAwesome6);

export default function ArchivedButton() {
  const router = useRouter();
  const hasUnread = true;
  return (
    <Pressable
      onPress={() => router.push("/(tabs)/chats/archived")}
      className="w-full px-safe-offset-6 gap-4 flex-row items-center rounded-xl h-20
 active:bg-primary-50 active:dark:bg-neutral-700 bg-background
      "
    >
      <View className="w-fit size-14 rounded-full  bg-primary-400 true-center">
        <StyledFontAwesome6
          name="box-archive"
          size={24}
          className="text-white/90"
        />
      </View>
      <View className="gap-1 flex-1">
        <View className="flex-row justify-between gap-2">
          <View className="flex-row gap-2 items-center">
            <ThemedText type="bodyXl" weight="bold">
              Archived Chats
            </ThemedText>
          </View>
          <ThemedText
            type="bodyMd"
            className={hasUnread ? "text-primary-400" : "text-neutral-300"}
          >
            11:47 PM
          </ThemedText>
        </View>
        <View className="flex-row gap-2 items-center">
          <View className="flex-row flex-1 gap-1 items-center">
            <ThemedText type="bodyLg" color="muted">
              Annie Miles, Arlene McCoy
            </ThemedText>
          </View>
          <View className="size-6 rounded-full items-center justify-center bg-primary-400">
            <ThemedText weight="bold">4</ThemedText>
          </View>
        </View>
      </View>
    </Pressable>
  );
}
