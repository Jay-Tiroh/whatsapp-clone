import Bg from "@/assets/images/bg.svg";
import ThemedText from "@/shared/components/ThemedText";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { FlashList } from "@shopify/flash-list";
import { useMemo } from "react";
import { Image, Pressable, StyleSheet, View } from "react-native";
import { withUniwind } from "uniwind";

const StyledBg = withUniwind(Bg);
// Wrap vector icon for Uniwind className support
const StyledIcon = withUniwind(FontAwesome6);

// 1. Define the data structure for a starred message
type StarredMessage = {
  id: string;
  name: string;
  message: string;
  time: string;
  date: string;
  avatarUrl: string;
};

// 2. Dummy Data
const DUMMY_DATA: StarredMessage[] = [
  {
    id: "1",
    name: "John Doe",
    message: "Orci maecenas hendrerit mattis consectetur. Mauris.",
    time: "15:46",
    date: "21/07/2021",
    avatarUrl: "https://i.pravatar.cc/100?img=1",
  },
  {
    id: "2",
    name: "Jane Smith",
    message:
      "Let's schedule a meeting for tomorrow to discuss the new features.",
    time: "14:22",
    date: "20/07/2021",
    avatarUrl: "https://i.pravatar.cc/100?img=2",
  },
  {
    id: "3",
    name: "Alice Johnson",
    message: "Can you send me the latest design assets?",
    time: "09:15",
    date: "19/07/2021",
    avatarUrl: "https://i.pravatar.cc/100?img=3",
  },
];

const StarredMessageItem = ({ item }: { item: StarredMessage }) => (
  <Pressable className="mx-4 my-2 overflow-hidden relative rounded-3xl active:opacity-80">
    <StyledBg
      className="absolute top-0 left-0 right-0 bottom-0 flex-1 w-full h-full dark:text-neutral-700 text-primary-100 bg-primary-50/80 dark:bg-neutral-800"
      style={StyleSheet.absoluteFill}
      preserveAspectRatio="xMidYMid slice"
    />
    <View className="flex-row items-center p-4 w-full gap-2">
      <View className="max-w-[80%] rounded-2xl bg-background px-4 py-3">
        <ThemedText type="bodyLg" color="option">
          {item.message}
        </ThemedText>
        <View className="mt-1 flex-row justify-end">
          <StyledIcon name="star" solid size={12} className="text-warning" />
        </View>
      </View>
      <View className="">
        <ThemedText color="muted">{item.time}</ThemedText>
      </View>
    </View>

    <View className="flex-row items-center justify-between px-4 py-3  bg-background">
      <View className="flex-row items-center gap-3">
        <Image
          source={{ uri: item.avatarUrl }}
          className="h-10 w-10 rounded-full bg-neutral-200"
          resizeMode="cover"
        />
        <ThemedText type="bodyLg" weight="bold">
          {item.name}
        </ThemedText>
      </View>
      <View className="flex-row items-center gap-3">
        <ThemedText type="bodyMd" color="muted">
          {item.date}
        </ThemedText>
        <StyledIcon
          name="chevron-right"
          size={16}
          className="text-neutral-300"
        />
      </View>
    </View>
  </Pressable>
);

// 4. Main Screen/List Component
export default function StarredMessagesScreen() {
  const data = useMemo(() => DUMMY_DATA, []);

  return (
    <View className="flex-1 dark:bg-background pt-2">
      <FlashList
        data={data}
        renderItem={({ item }) => <StarredMessageItem item={item} />}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}
