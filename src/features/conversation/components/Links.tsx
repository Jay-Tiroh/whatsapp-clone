import ThemedText from "@/shared/components/ThemedText";
import { FlashList } from "@shopify/flash-list";
import { useMemo } from "react";
import { Image, View } from "react-native";

// 1. Define the flat data types
type ListItem =
  | { type: "header"; title: string; id: string }
  | { type: "link"; title: string; url: string; imageUrl: string; id: string };

// 2. Dummy Data (Flattened for FlashList performance)
const DUMMY_DATA: ListItem[] = [
  { type: "header", title: "Today", id: "h1" },
  {
    type: "link",
    id: "l1",
    title: "Investor Landing Page",
    imageUrl: "https://picsum.photos/100/100?random=1",
    url: "https://dribbble.com/shots/16979429-Invester-Landi...",
  },
  {
    type: "link",
    id: "l2",
    title: "Investor Landing Page",
    imageUrl: "https://picsum.photos/100/100?random=2",
    url: "https://dribbble.com/shots/16979429-Invester-Landi...",
  },
  { type: "header", title: "Yesterday", id: "h2" },
  {
    type: "link",
    id: "l3",
    title: "Remote Work Illustration",
    imageUrl: "https://picsum.photos/100/100?random=3",
    url: "https://dribbble.com/shots/16971656-Remote-Work-I...",
  },
  {
    type: "link",
    id: "l4",
    title: "Invester Mobile App",
    imageUrl: "https://picsum.photos/100/100?random=4",
    url: "https://dribbble.com/shots/16963068-Invester-Mobil...",
  },
  {
    type: "link",
    id: "l5",
    title: "Weblitics Landing Page",
    imageUrl: "https://picsum.photos/100/100?random=5",
    url: "https://dribbble.com/shots/16835157-Weblitics-Landi...",
  },
  { type: "header", title: "26 Oct 2021", id: "h3" },
  {
    type: "link",
    id: "l6",
    title: "Real Estate App",
    imageUrl: "https://picsum.photos/100/100?random=6",
    url: "https://dribbble.com/shots/12345678-Real-Estate-App...",
  },
];

export default function LinksScreen() {
  const data = useMemo(() => DUMMY_DATA, []);

  const renderItem = ({ item }: { item: ListItem }) => {
    // SECTION HEADER
    if (item.type === "header") {
      return (
        <View className="flex-row items-center pt-8 pb-4 gap-4">
          <ThemedText type="bodyXl" weight="bold" color="option">
            {item.title}
          </ThemedText>
          {/* Horizontal Divider Line */}
          <View className="flex-1 h-[1px] bg-divider dark:bg-neutral-600" />
        </View>
      );
    }

    // LINK ITEM
    return (
      <View className="flex-row items-center py-3 gap-4">
        {/* Left Side: Thumbnail with Border */}
        <View className="w-16 h-16 rounded-2xl border border-divider bg-surface overflow-hidden true-center">
          <Image
            source={{ uri: item.imageUrl }}
            className="w-full h-full"
            resizeMode="cover"
          />
        </View>

        {/* Right Side: URL Text */}
        <View className="flex-1 gap-2 justify-center">
          <ThemedText
            type="bodyLg"
            weight="bold"
            numberOfLines={1}
            ellipsizeMode="tail"
            className="leading-tight"
          >
            {item.title}
          </ThemedText>
          <ThemedText
            type="bodyMd"
            color="primary"
            numberOfLines={2}
            ellipsizeMode="tail"
            className="leading-tight"
          >
            {item.url}
          </ThemedText>
        </View>
      </View>
    );
  };

  return (
    <View className="flex-1 px-4">
      <FlashList
        data={data}
        renderItem={renderItem}
        // Critical: Separate reuse pools for headers and items
        getItemType={(item) => item.type}
        keyExtractor={(item) => item.id}
        // estimatedItemSize={85}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}
