import { useRequestOtp } from "@/features/auth/hooks/useAuth";
import Spacer from "@/shared/components/Spacer";
import ThemedText from "@/shared/components/ThemedText";
import { showErrorToast } from "@/shared/hooks/showToast";
import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import { useRouter } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { Text, View } from "react-native";
import { CountryPicker } from "../components/CountryPicker";
import AuthTemplate from "../components/Template";
import {
  LoginFormInput,
  LoginFormOutput,
  loginSchema,
} from "../validation/auth.validation";

const LoginScreen = () => {
  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormInput, any, LoginFormOutput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      phone: "",
      country: null,
    },
    mode: "onChange",
  });
  const router = useRouter();
  const requestOtp = useRequestOtp();

  const onSubmit = (data: LoginFormOutput) => {
    const e164 = `+${data.phone.replace(/\D/g, "")}`;

    requestOtp.mutate(
      { phoneNumber: e164 },
      {
        onSuccess: (response) => {
          router.navigate({
            pathname: "/(auth)/verify",
            params: {
              challengeId: response.challengeId,
              phoneNumberMasked: response.phoneNumberMasked,
              codeLength: String(response.codeLength),
              resendInSeconds: String(response.resendInSeconds),
            },
          });
        },
        onError: (error) => {
          if (error instanceof AxiosError) {
            console.log("status:", error.response?.status);
            console.log("data:", error.response?.data);
            console.log(error);
          } else {
            console.log("unexpected error:", error);
          }
          showErrorToast({
            title: "Couldn't send code",
            message: "Check your number and try again.",
          });
        },
      },
    );
  };

  const onError = (errors: any) => {
    console.log("Validation Failed!", errors);
  };

  return (
    <AuthTemplate
      title="What's your phone number?"
      description="We will send you the verification code."
      buttonProps={{
        onPress: handleSubmit(onSubmit, onError),
        isLoading: requestOtp.isPending,
      }}
    >
      <View className="flex-1">
        <ThemedText
          type="bodyMd"
          weight="medium"
          className="px-1"
          color="label"
        >
          Phone Number
        </ThemedText>
        <Spacer size={8} />
        <Controller
          control={control}
          name="phone"
          render={({ field: { value, onChange } }) => (
            <CountryPicker
              value={value}
              onChangeText={onChange}
              onCountryChange={(country) =>
                setValue("country", country, { shouldValidate: true })
              }
            />
          )}
        />
        {errors.phone && (
          <Text className="text-red-400 text-body-sm mt-1 px-1">
            {errors.phone.message}
          </Text>
        )}
        {errors.country && (
          <Text className="text-red-400 text-body-sm mt-1 px-1">
            {errors.country.message}
          </Text>
        )}
      </View>
    </AuthTemplate>
  );
};

export default LoginScreen;
