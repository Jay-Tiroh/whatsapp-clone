import AuthTemplate from "@/features/auth/components/Template";
import StyledOtpInput from "@/shared/components/StyledOtpInput";
import ThemedButton from "@/shared/components/ThemedButton";
import { useRouter } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
const VerifyScreen = () => {
  const desc = (
    <Text className="text-body-md font-display-regular text-neutral-300 dark:text-neutral-200 mt-2">
      Enter the code number we sent to{" "}
      <Text className="text-body-md font-display-medium text-neutral-600 dark:text-white/90 mt-2">
        +62 85-830-544-382.
      </Text>
    </Text>
  );
  const router = useRouter();
  return (
    <AuthTemplate
      goBack
      title="Verification code"
      description={desc}
      buttonProps={{
        onPress: () => router.navigate("/(auth)/name"),
      }}
    >
      <View className="gap-2">
        <StyledOtpInput />
        <Text className="text-body-md font-display-regular text-neutral-300 dark:text-neutral-200 mt-2 text-center">
          If you don't get the code, resend it in{" "}
          <Text className="text-body-md font-display-medium text-neutral-600 dark:text-white/90 mt-2 ">
            0
          </Text>{" "}
          seconds.
        </Text>

        <ThemedButton label="Resend code" variant="tertiary" />
      </View>
    </AuthTemplate>
  );
};

export default VerifyScreen;

const styles = StyleSheet.create({
  pinContainer: {},
});
