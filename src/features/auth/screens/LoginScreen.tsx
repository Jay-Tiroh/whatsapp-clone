import Spacer from "@/shared/components/Spacer";
import ThemedText from "@/shared/components/ThemedText";
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
  const onSubmit = (data: LoginFormOutput) => {
    // data.phone is now the full merged string, e.g. "+234 801 234 5678"
    const e164 = `+${data.phone.replace(/\D/g, "")}`;
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
