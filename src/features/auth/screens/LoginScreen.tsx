import Spacer from "@/shared/components/Spacer";
import { formatPhoneInternational } from "@/shared/utils/formatPhoneNumber";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { Text, View } from "react-native";
import { CountryPicker } from "../components/CountryPicker";
import AuthTemplate from "../components/Template";
import {
  LoginFormInput,
  LoginFormOutput,
  loginSchema,
} from "../schemas/loginSchema";

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
  const onSubmit = (data: LoginFormOutput) => {
    // data.country is guaranteed non-null here — Zod already validated it
    const e164 = `${data.country.dialCode}${data.phone.replace(/\D/g, "")}`;
    console.log({ ...data, e164 });
    router.navigate("/(auth)/verify");
  };
  const onError = (errors: any) => {
    console.log("Validation Failed!", errors);
  };

  return (
    <AuthTemplate
      title="What's your phone number?"
      description="We will send you the verification code."

      buttonProps={{
        onPress: handleSubmit(onSubmit),
      }}
    >
      <View className="flex-1">
        <Text className="text-body-md font-display-medium text-neutral-600 dark:text-neutral-50 px-1">
          Phone Number
        </Text>
        <Spacer size={8} />
        <Controller
          control={control}
          name="phone"
          render={({ field: { value, onChange } }) => (
            <CountryPicker
              value={value}
              onChangeText={(text) => onChange(formatPhoneInternational(text))}
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
