import AuthTemplate from "@/features/auth/components/Template";
import StyledOtpInput from "@/shared/components/StyledOtpInput";
import ThemedButton from "@/shared/components/ThemedButton";
import ThemedText from "@/shared/components/ThemedText";
import { useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";
const VerifyScreen = () => {
  const desc = (
    <ThemedText type="bodyMd" className="mt-2 text-center" color="muted">
      Enter the code number we sent to{" "}
      <ThemedText type="bodyMd" weight="medium" className="mt-2" color="label">
        +62 85-830-544-382.
      </ThemedText>
    </ThemedText>
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

        <ThemedText type="bodyMd" className="mt-2 text-center" color="muted">
          If you don't get the code, resend it in{" "}
          <ThemedText
            type="bodyMd"
            weight="medium"
            className="mt-2"
            color="label"
          >
            0
          </ThemedText>{" "}
          seconds.
        </ThemedText>

        <ThemedButton label="Resend code" variant="tertiary" />
      </View>
    </AuthTemplate>
  );
};

export default VerifyScreen;

const styles = StyleSheet.create({
  pinContainer: {},
});
