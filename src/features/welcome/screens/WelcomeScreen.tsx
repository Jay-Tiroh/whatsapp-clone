import Logo from "@/assets/icons/logo.svg";
import IllDark from "@/assets/images/onboard-ill-dark.svg";
import Ill from "@/assets/images/onboard-ill.svg";
import ThemedButton from "@/shared/components/ThemedButton";
import ThemedText from "@/shared/components/ThemedText";
import { useRouter } from "expo-router";
import { View } from "react-native";
export default function WelcomeScreen() {
  const router = useRouter();
  return (
    <View className="flex-1  pt-safe-offset-10 items-center justify-around bg-primary-tint relative gap-10.5">
      <Logo />
      <View className=" items-center gap-14">
        <View className="dark:hidden">
          <Ill />
        </View>
        <View className=" hidden dark:block">
          <IllDark />
        </View>
        <View className="items-center w-full pb-safe-offset-5">
          <ThemedText type="h3" className="mb-4 text-center max-w-82">
            Stay connected with your friends and family
          </ThemedText>
          <ThemedText
            type="bodyMd"
            color="muted"
            className="text-center dark:text-neutral-300 max-w-82"
          >
            ChatMe is messaging app that will help you to connect with everyone.
          </ThemedText>
        </View>
      </View>

      <View className="w-full max-w-82 justify-end pb-safe-offset-10">
        <ThemedButton
          variant="primary"
          label="Get Started"
          onPress={() => router.navigate("/login")}
        />
      </View>
    </View>
  );
}
