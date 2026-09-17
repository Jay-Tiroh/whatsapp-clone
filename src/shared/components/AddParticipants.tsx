import { mockContactMatches } from "@/features/chats/mocks/discovery.mocks";
import { ContactMatch } from "@/features/contacts/types/discovery.types";
import Header from "@/features/folder/components/FolderSheetHeader";
import SearchBar from "@/shared/components/Searchbar";
import Spacer from "@/shared/components/Spacer";
import ThemedButton from "@/shared/components/ThemedButton";
import ThemedText from "@/shared/components/ThemedText";
import { Image } from "expo-image";
import { useState } from "react";
import { ScrollView } from "react-native";

import { View } from "react-native";
import { withUniwind } from "uniwind";

const StyledScrollView = withUniwind(ScrollView);
const StyledImage = withUniwind(Image);
export default function AddParticipants() {
  const [query, setQuery] = useState<string>("");

  const matches = mockContactMatches;
  return (
    <>
      <Header title="Add Participants" stage={2} />
      <View className="px-6 pt-6 pb-8">
        <SearchBar
          placeholder="Search people"
          value={query}
          onChangeText={setQuery}
          variant="sheet"
        />
      </View>
      <StyledScrollView
        nestedScrollEnabled
        contentContainerClassName="pb-2  flex-row flex-wrap gap-4 px-6
        justify-between items-center"
        className="h-[63%]"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {matches.map((contact) => (
          <Person key={contact.user.id} contact={contact} />
        ))}
      </StyledScrollView>
      <Spacer size={30} />
      <View className="px-6 ">
        <ThemedButton label="Next" />
      </View>
    </>
  );
}

const Person = ({ contact }: { contact: ContactMatch }) => {
  return (
    <View className="items-center gap-2 w-[20%]">
      <StyledImage
        source={
          contact.user.avatarUrl
            ? { uri: contact.user.avatarUrl }
            : require("@/assets/images/avatar.png")
        }
        className="w-14 h-14 rounded-full"
        contentFit="cover"
        cachePolicy="memory-disk"
      />
      <ThemedText
        numberOfLines={1}
        ellipsizeMode="tail"
      >{`${contact.user.displayName}`}</ThemedText>
    </View>
  );
};
