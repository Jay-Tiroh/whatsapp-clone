import { useMatchedContacts } from "@/features/contacts/hooks/useMatchedContacts";
import { ContactMatch } from "@/features/contacts/types/discovery.types";

import SearchBar from "@/shared/components/Searchbar";
import ThemedText from "@/shared/components/ThemedText";
import Feather from "@expo/vector-icons/Feather";
import { Image } from "expo-image";
import { useMemo, useState } from "react";
import { ScrollView, View } from "react-native";
import { withUniwind } from "uniwind";

const StyledImage = withUniwind(Image);
const StyledFeather = withUniwind(Feather);
const StyledScrollView = withUniwind(ScrollView);
const alphabets = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const OTHER_GROUP_LETTER = "#";

export default function ContactList() {
  const { matches, isLoading: matchesLoading } = useMatchedContacts();
  const [query, setQuery] = useState("");

  const filteredMatches = useMemo(() => {
    const q = query.trim().toLowerCase();
    const valid = matches.filter((match) => match?.user?.id);
    if (!q) {
      return valid;
    }
    return valid.filter((match) =>
      match?.user?.displayName?.toLowerCase().includes(q),
    );
  }, [matches, query]);

  const sortedMatches = useMemo(() => {
    const groups = alphabets.map((letter) => ({
      letter,
      contacts: filteredMatches.filter((match) =>
        match?.user?.displayName?.toUpperCase().startsWith(letter),
      ),
    }));

    const grouped = new Set(groups.flatMap((g) => g.contacts));
    const other = filteredMatches.filter((match) => !grouped.has(match));

    return [
      ...groups,
      ...(other.length > 0
        ? [{ letter: OTHER_GROUP_LETTER, contacts: other }]
        : []),
    ].filter((group) => group.contacts.length > 0);
  }, [filteredMatches]);

  const isSearching = query.trim().length > 0;

  return (
    <>
      {/* Header */}
      <View className="px-6 pt-12 pb-8">
        <ThemedText type="h4" className="text-center mb-4">
          Contact
        </ThemedText>
        <SearchBar
          placeholder="Search contacts"
          value={query}
          onChangeText={setQuery}
          variant="sheet"
        />
      </View>
      {/* Contacts — plain ScrollView; TrueSheet's `scrollable` prop auto-detects it */}
      <StyledScrollView
        nestedScrollEnabled
        contentContainerClassName="pb-safe-offset-100"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {matchesLoading ? (
          <View className="items-center py-12">
            <ThemedText color="muted">Finding your contacts…</ThemedText>
          </View>
        ) : filteredMatches.length === 0 ? (
          <View className="items-center py-12">
            <ThemedText color="muted">No contacts found</ThemedText>
          </View>
        ) : isSearching ? (
          filteredMatches.map((contact) => (
            <ContactListItem key={contact.user.id} contact={contact} />
          ))
        ) : (
          sortedMatches.map((group) => (
            <View key={group.letter}>
              <View className="h-8 justify-center bg-divider dark:bg-neutral-500">
                <ThemedText
                  color="muted"
                  type="bodyLg"
                  weight="bold"
                  className="px-6 py-1 text-xs"
                >
                  {group.letter}
                </ThemedText>
              </View>
              {group.contacts.map((contact) => (
                <ContactListItem key={contact.user.id} contact={contact} />
              ))}
            </View>
          ))
        )}
      </StyledScrollView>
    </>
  );
}

const ContactListItem = ({ contact }: { contact: ContactMatch }) => {
  return (
    <View className="flex-row items-center gap-4 p-4 px-6">
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
      <View className="flex-1 gap-2">
        <ThemedText>{`${contact.user.displayName}`}</ThemedText>
        <ThemedText color="muted">{contact.matchedPhoneNumber}</ThemedText>
      </View>
      <StyledFeather name="chevron-right" size={24} className="text-muted" />
    </View>
  );
};
