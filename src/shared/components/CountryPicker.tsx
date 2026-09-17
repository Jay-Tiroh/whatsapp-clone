import ThemedText from "@/shared/components/ThemedText";
import { useCountries, type Country } from "@/shared/hooks/useCountries";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { cn } from "tailwind-variants";

type CountryPickerProps = {
  value?: string;
  onChangeText?: (text: string) => void;
  onCountryChange?: (country: Country) => void;
  showDialCode?: boolean;
  showPhoneInput?: boolean;
  error?: string;
  disabled?: boolean;
};

const DEFAULT_COUNTRY_CODE = "NG";

// Hardcoded fallback so the dial code can be prewritten immediately,
// without waiting on the countries list to finish fetching.
// Adjust the fields here if your `Country` type has more required props.
const FALLBACK_DEFAULT_COUNTRY: Country = {
  code: DEFAULT_COUNTRY_CODE,
  name: "Nigeria",
  dialCode: "+234",
  flag: "🇳🇬",
} as Country;

const onlyDigits = (s: string) => s.replace(/[^\d]/g, "");
const dialDigits = (c: Country) => onlyDigits(c.dialCode);

const matchCountryByDigits = (digits: string, countries: Country[]) => {
  let best: Country | null = null;
  for (const c of countries) {
    const code = dialDigits(c);
    if (!code) continue;
    if (
      digits.startsWith(code) &&
      (!best || code.length > dialDigits(best).length)
    ) {
      best = c;
    }
  }
  return best;
};

// Groups local digits the same way as the placeholder, e.g. 8012345678 -> "801 234 5678"
const formatLocalDigits = (digits: string) => {
  if (!digits) return "";
  const groups: string[] = [];
  let i = 0;
  while (digits.length - i > 4) {
    groups.push(digits.slice(i, i + 3));
    i += 3;
  }
  groups.push(digits.slice(i));
  return groups.join(" ");
};

const buildValue = (country: Country, localDigits: string) =>
  `+${dialDigits(country)}${
    localDigits ? " " + formatLocalDigits(localDigits) : " "
  }`;

export const CountryPicker = ({
  value = "",
  onChangeText,
  onCountryChange,
  showDialCode = true,
  showPhoneInput = true,
  error,
  disabled = false,
}: CountryPickerProps) => {
  const { data: countries = [], isLoading } = useCountries();
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const insets = useSafeAreaInsets();
  const hasSyncedDefault = useRef(false);

  const defaultCountry = useMemo(
    () => countries.find((c) => c.code === DEFAULT_COUNTRY_CODE) ?? null,
    [countries],
  );

  const displayCountry = selectedCountry;

  // Seed immediately on mount — don't wait for the countries fetch to resolve.
  useEffect(() => {
    if (hasSyncedDefault.current) return;
    hasSyncedDefault.current = true;
    const initial = defaultCountry ?? FALLBACK_DEFAULT_COUNTRY;
    setSelectedCountry(initial);
    onCountryChange?.(initial);
    if (!value) onChangeText?.(buildValue(initial, ""));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Once the real list loads, swap the fallback object for the proper one
  // (better flag/name data) — but only if the user hasn't picked anything else.
  useEffect(() => {
    if (!defaultCountry) return;
    setSelectedCountry((prev) =>
      prev && prev.code === DEFAULT_COUNTRY_CODE && prev !== defaultCountry
        ? defaultCountry
        : prev,
    );
  }, [defaultCountry]);

  const filteredCountries = useMemo(() => {
    if (!searchQuery) return countries;
    return countries.filter((c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [countries, searchQuery]);

  const handlePhoneChange = (text: string) => {
    const isDeleting = text.length < value.length;
    const hasPlus = text.trim().startsWith("+");

    if (hasPlus) {
      let digits = onlyDigits(text);

      // Deleting a separating space doesn't remove a digit, so the string
      // gets rebuilt identical to what it was — backspace looks "stuck".
      // Treat that as deleting the digit before the space too.
      if (isDeleting && digits.length === onlyDigits(value).length) {
        digits = digits.slice(0, -1);
      }

      if (digits.length > 0) {
        const match = matchCountryByDigits(digits, countries);
        if (match) {
          if (!selectedCountry || match.code !== selectedCountry.code) {
            setSelectedCountry(match);
            onCountryChange?.(match);
          }
          const local = digits.slice(dialDigits(match).length);
          onChangeText?.(buildValue(match, local));
          return;
        }
      }
    }

    onChangeText?.(text);
  };

  const handleSelect = (country: Country) => {
    setSelectedCountry(country);
    setModalVisible(false);
    setSearchQuery("");
    onCountryChange?.(country);

    const digits = onlyDigits(value);
    const oldCode = selectedCountry ? dialDigits(selectedCountry) : "";
    const local =
      oldCode && digits.startsWith(oldCode)
        ? digits.slice(oldCode.length)
        : digits;

    onChangeText?.(buildValue(country, local));
  };

  return (
    <View>
      <View
        className={cn(
          "flex-row items-center justify-between bg-surface rounded-xl px-4 py-2 min-h-13 border",
          error
            ? "border-red-500"
            : isFocused
              ? "border-primary ring-1 ring-primary bg-primary-50 dark:bg-neutral-800"
              : "border-divider dark:border-neutral-300",
        )}
      >
        <TouchableOpacity
          className={
            showPhoneInput
              ? "flex-row items-center pr-3 border-r border-border h-full"
              : "flex-row items-center h-full flex-1 justify-between"
          }
          onPress={disabled ? undefined : () => setModalVisible(true)}
          disabled={isLoading && !displayCountry}
        >
          {isLoading && !displayCountry ? (
            <ActivityIndicator size="small" colorClassName="accent-primary" />
          ) : (
            <>
              <View className="flex-row items-center">
                <Text className="text-h4">{displayCountry?.flag}</Text>
                {!showPhoneInput && (
                  <Text className="ml-2 text-body-sm text-foreground">
                    {displayCountry?.name}
                  </Text>
                )}
              </View>
              {!showPhoneInput && showDialCode && (
                <Text className="ml-1.5 text-body-md text-foreground">
                  {displayCountry?.dialCode}
                </Text>
              )}
            </>
          )}
        </TouchableOpacity>
        {showPhoneInput && (
          <TextInput
            className="flex-1 ml-3 font-display-medium text-foreground text-body-md h-full"
            placeholderTextColorClassName="accent-neutral-300 dark:accent-neutral-200"
            keyboardType="phone-pad"
            value={value}
            onChangeText={disabled ? undefined : handlePhoneChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="+234 801 234 5678"
          />
        )}
      </View>

      {error && (
        <ThemedText className="text-red-500 font-display-regular text-body-sm mt-2">
          {error}
        </ThemedText>
      )}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View className="flex-1 bg-black/30 justify-end">
          <View
            className="bg-surface dark:bg-neutral-700 rounded-t-3xl h-3/4"
            style={{ paddingBottom: insets.bottom }}
          >
            <View className="flex-row justify-between items-center p-5 border-b border-border dark:border-neutral-500">
              <Text className="text-body-xl font-display-bold text-foreground">
                Select Country
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text className="text-body-md text-primary">Close</Text>
              </TouchableOpacity>
            </View>

            <View className="px-5 py-3 border-b border-border dark:border-neutral-500">
              <TextInput
                className="bg-background dark:bg-neutral-600 rounded-xl px-4 h-11 text-foreground text-body-md"
                placeholderTextColorClassName="accent-muted"
                placeholder="Search countries..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoCorrect={false}
              />
            </View>

            <FlatList
              data={filteredCountries}
              keyExtractor={(item) => item.code}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              initialNumToRender={20}
              renderItem={({ item }) => (
                <TouchableOpacity
                  className="flex-row items-center py-4 px-5 border-b border-border dark:border-neutral-500"
                  onPress={() => handleSelect(item)}
                >
                  <Text className="text-h4">{item.flag}</Text>
                  <Text className="flex-1 ml-3 text-body-lg text-neutral-600 dark:text-neutral-100 font-display-medium">
                    {item.name}
                  </Text>
                  {showDialCode && (
                    <Text className="text-body-md text-muted text-neutral-400 font-display-medium">
                      {item.dialCode}
                    </Text>
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};
