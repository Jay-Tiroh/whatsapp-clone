import MemberItem, {
  Member,
} from "@/features/conversation/components/GroupMember";
import ThemedText from "@/shared/components/ThemedText";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import {
  FlashList,
  FlashListProps,
  type ListRenderItemInfo,
} from "@shopify/flash-list";
import React, { useCallback, useState } from "react";
import { View } from "react-native";
import { withUniwind } from "uniwind";

const StyledFlashList = withUniwind(FlashList) as <T>(
  props: FlashListProps<T> & {
    className?: string;
    contentContainerClassName?: string;
  },
) => React.ReactElement;
const StyledMaterialIcons = withUniwind(MaterialIcons);

const DUMMY_MEMBERS: Member[] = [
  {
    id: "1",
    name: "Albert Flores",
    statusText: "Online",
    isOnline: true,
    avatarUrl: "https://picsum.photos/seed/albert/200",
  },
  {
    id: "2",
    name: "Annie Miles",
    statusText: "Last seen 16 minutes ago",
    isOnline: false,
    avatarUrl: "https://picsum.photos/seed/annie/200",
  },
  {
    id: "3",
    name: "Bessie Cooper",
    statusText: "Last seen 2 hours ago",
    isOnline: false,
    avatarUrl: "https://picsum.photos/seed/bessie/200",
  },
  {
    id: "4",
    name: "Brianne Russell",
    statusText: "Last seen 2 hours ago",
    isOnline: false,
    avatarUrl: "https://picsum.photos/seed/brianne/200",
  },
  {
    id: "5",
    name: "Cody Fisher",
    statusText: "Online",
    isOnline: true,
    avatarUrl: "https://picsum.photos/seed/cody/200",
  },
  {
    id: "6",
    name: "Dianne Russell",
    statusText: "Last seen 5 hours ago",
    isOnline: false,
    avatarUrl: "https://picsum.photos/seed/dianne/200",
  },
];

// Hoisted — stable reference across renders
const ItemSeparator = () => <View className="h-2" />;

interface MembersListProps {
  members?: Member[];
}

export default function MembersList({
  members = DUMMY_MEMBERS,
}: MembersListProps) {
  const [listData, setListData] = useState(members);

  const handleMessage = useCallback((id: string) => {
    console.log("Message member:", id);
  }, []);

  const handleInfo = useCallback((id: string) => {
    console.log("View info for member:", id);
  }, []);

  const handleKick = useCallback((id: string) => {
    setListData((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<Member>) => (
      <MemberItem
        member={item}
        onMessage={handleMessage}
        onInfo={handleInfo}
        onKick={handleKick}
      />
    ),
    [handleMessage, handleInfo, handleKick],
  );

  const keyExtractor = useCallback((item: Member) => item.id, []);

  return (
    <View className="flex-1 w-full">
      <View className="flex-row items-center justify-between px-6 gap-5">
        <ThemedText
          type="bodyLg"
          weight="medium"
          color="option"
          className="flex-1"
        >
          {listData.length} members
        </ThemedText>
        <StyledMaterialIcons
          name="search"
          size={24}
          className="text-neutral-600 dark:text-neutral-100"
        />
        <StyledMaterialIcons
          name="person-add-alt"
          size={24}
          className="text-neutral-600 dark:text-neutral-100"
        />
      </View>
      <StyledFlashList
        data={listData}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        // estimatedItemSize={80}
        // contentContainerClassName="pb-safe-offset-10"
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={ItemSeparator}
      />
    </View>
  );
}
