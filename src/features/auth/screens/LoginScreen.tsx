import AuthTemplate from "@/features/auth/components/Template";
import { useRequestOtp } from "@/features/auth/hooks/useAuth";
import {
  LoginFormInput,
  LoginFormOutput,
  loginSchema,
} from "@/features/auth/validation/auth.validation";
import { CountryPicker } from "@/shared/components/CountryPicker";
import Spacer from "@/shared/components/Spacer";
import ThemedText from "@/shared/components/ThemedText";
import { showErrorToast } from "@/shared/hooks/showToast";
import { getErrorMessage } from "@/shared/utils/errors";
import { logger } from "@/shared/utils/logger";
import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import { useRouter } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { Text, View } from "react-native";

const LoginScreen = () => {
  const router = useRouter();
  const requestOtp = useRequestOtp();

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
            logger.error("status:", error.response?.status);
            logger.error("data:", error.response?.data);
            logger.error(error);
          } else {
            logger.error("unexpected error:", error);
          }
          showErrorToast({
            title: "Couldn't send code",
            message:
              getErrorMessage(error) ?? "Check your number and try again.",
          });
        },
      },
    );
  };

  const onError = (errors: any) => {
    logger.warn("Validation Failed!", errors);
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
