import GalleryLayout from "@/features/conversation/components/GalleryLayout";
import LinksScreen from "@/features/conversation/components/Links";
import SharedHeader from "@/features/conversation/components/SharedHeader";
import StarredMessagesScreen from "@/features/conversation/components/StarredMessages";
import ThemedText from "@/shared/components/ThemedText";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  useWindowDimensions,
  View,
} from "react-native";

type TabType = "photo" | "star" | "links";

const TAB_ORDER: TabType[] = ["photo", "star", "links"];

const MapTabToTitle: Record<TabType, string> = {
  photo: "Photos",
  star: "Starred Messages",
  links: "Links",
};

export default function SharedScreen() {
  const queryTab = useLocalSearchParams<{ tab: TabType }>().tab;
  const [activeTab, setActiveTab] = useState<TabType>("photo");
  const { width } = useWindowDimensions();
  const scrollRef = useRef<ScrollView>(null);

  const scrollToTab = (tab: TabType, animated = true) => {
    const index = TAB_ORDER.indexOf(tab);
    scrollRef.current?.scrollTo({ x: index * width, animated });
  };

  // Sync to a `?tab=` deep link, without animating on first mount.
  useEffect(() => {
    if (queryTab && TAB_ORDER.includes(queryTab)) {
      setActiveTab(queryTab);
      scrollToTab(queryTab, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryTab]);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    scrollToTab(tab);
  };

  const handleMomentumScrollEnd = (
    e: NativeSyntheticEvent<NativeScrollEvent>,
  ) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / width);
    const tab = TAB_ORDER[index];
    if (tab && tab !== activeTab) {
      setActiveTab(tab);
    }
  };

  return (
    <View className="flex-1 bg-white dark:bg-background gap-5">
      <SharedHeader
        title={MapTabToTitle[activeTab]}
        hasSearch={activeTab === "star"}
      />
      <Tabs active={activeTab} handleTabChange={handleTabChange} />
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        style={{ flex: 1 }}
      >
        <View style={{ width, flex: 1 }}>
          <GalleryLayout />
        </View>
        <View style={{ width, flex: 1 }}>
          <StarredMessagesScreen />
        </View>
        <View style={{ width, flex: 1 }}>
          <LinksScreen />
        </View>
      </ScrollView>
    </View>
  );
}

interface TabsProps {
  active: TabType;
  handleTabChange: (tab: TabType) => void;
}

const Tabs = ({ active = "photo", handleTabChange }: TabsProps) => {
  const tabs = ["Photo", "Star", "Links"];
  return (
    <View className="h-10 w-full max-w-11/12 mx-auto p-1 gap-1 items-start flex-row bg-bg-light dark:bg-neutral-800 rounded-xl">
      {tabs.map((tab) => {
        const isActive = active === tab.toLowerCase();
        return (
          <Pressable
            onPress={() => handleTabChange(tab.toLowerCase() as TabType)}
            key={tab}
            className={`h-8 px-2 true-center flex-row flex-1 ${
              isActive
                ? "shadow-sm elevation-[8] rounded-[10px] bg-surface"
                : "rounded-xl"
            }`}
          >
            <ThemedText
              type="bodyMd"
              weight={isActive ? "semibold" : "medium"}
              color={isActive ? "default" : undefined}
              className={`text-center flex-1 ${
                isActive ? "" : "text-neutral-500 dark:text-neutral-200"
              }`}
            >
              {tab}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
};
