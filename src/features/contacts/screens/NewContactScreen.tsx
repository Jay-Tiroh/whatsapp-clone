import { CountryPicker } from "@/shared/components/CountryPicker";
import Spacer from "@/shared/components/Spacer";
import ThemedButton from "@/shared/components/ThemedButton";
import ThemedText from "@/shared/components/ThemedText";
import ThemedTextInput from "@/shared/components/ThemedTextInput";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useRouter } from "expo-router";
import { Pressable, View } from "react-native";
import { withUniwind } from "uniwind";
export default function NewContactScreen() {
  return (
    <View className="w-full flex-1 pb-safe-offset-6 bg-background">
      <Header />
      {/*form*/}
      <Spacer size={98} />
      <View className="flex-1">
        <View className="p-6 gap-6">
          <ThemedTextInput label="First Name" placeholder="First Name" />
          <ThemedTextInput label="Last Name" placeholder="Last Name" />
          <View className="gap-3">
            <ThemedText weight="medium">Phone Number</ThemedText>
            <CountryPicker showDialCode={true} showPhoneInput={true} />
          </View>
        </View>
        {/*Qr code section*/}
        <View className="py-2 gap-2 justify-center items-center ">
          <StyledMaterialCommunityIcons
            name="qrcode"
            size={38}
            className="text-primary"
          />
          <ThemedText type="bodyLg" color="muted">
            Or add via QR code
          </ThemedText>
        </View>
      </View>
      <View className="px-6">
        <ThemedButton label="Save" />
      </View>
    </View>
  );
}

const StyledIonicons = withUniwind(Ionicons);
const StyledFontAwesome5 = withUniwind(FontAwesome5);
const StyledMaterialCommunityIcons = withUniwind(MaterialCommunityIcons);
const Header = () => {
  const router = useRouter();
  return (
    <View className="h-45.5 py-6 pt-safe-offset-6 bg-primary-400 dark:bg-neutral-700 relative w-full">
      <View className="flex-row true-center px-6 relative">
        <Pressable
          className="active:opacity-70 absolute left-6"
          onPress={() => router.back()}
          hitSlop={20}
        >
          <StyledIonicons
            name="chevron-back"
            size={24}
            className="text-white/90"
          />
        </Pressable>
        <ThemedText
          type="bodyXl"
          weight="bold"
          className="text-white/90 flex-1 text-center"
        >
          New Contact
        </ThemedText>
      </View>

      <View className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 border-2 border-background rounded-full true-center size-37 bg-neutral-100">
        <StyledFontAwesome5
          name="user-alt"
          size={87}
          className="text-white/90"
        />
        <View className="size-10 rounded-full true-center bg-primary-400 absolute bottom-0 right-0 ">
          <StyledMaterialCommunityIcons
            name="camera-plus"
            size={20}
            className="text-white/90"
          />
        </View>
      </View>
    </View>
  );
};
