import AuthTemplate from "@/features/auth/components/Template";
import { useResendOtp, useVerifyOtp } from "@/features/auth/hooks/useAuth";
import { useAuthStore } from "@/features/auth/store/authStore";
import { getAuthDestination } from "@/features/auth/utils/getAuthDestination";
import {
  VerifyOtpFormValues,
  verifyOtpSchema,
} from "@/features/auth/validation/auth.validation";
import StyledOtpInput from "@/shared/components/StyledOtpInput";
import ThemedButton from "@/shared/components/ThemedButton";
import ThemedText from "@/shared/components/ThemedText";
import { showErrorToast } from "@/shared/hooks/showToast";
import { getErrorMessage } from "@/shared/utils/errors";
import { logger } from "@/shared/utils/logger";
import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import { Href, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { View } from "react-native";
import { OtpInputRef } from "react-native-otp-entry";

const useResendTimer = (initialSeconds: number) => {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearInterval(timer);
  }, [secondsLeft]);
  return { secondsLeft, setSecondsLeft };
};

const VerifyScreen = () => {
  const router = useRouter();
  const setSession = useAuthStore((state) => state.setSession);

  const params = useLocalSearchParams<{
    challengeId: string;
    phoneNumberMasked: string;
    codeLength: string;
    resendInSeconds: string;
  }>();

  const otpRef = useRef<OtpInputRef>(null);

  const {
    handleSubmit,
    setValue,
    formState: { errors, isValid },
  } = useForm<VerifyOtpFormValues>({
    resolver: zodResolver(verifyOtpSchema),
    defaultValues: { code: "" },
    mode: "onChange",
  });

  const verifyOtp = useVerifyOtp();
  const resendOtp = useResendOtp();

  const [challengeId, setChallengeId] = useState(params.challengeId);
  const { secondsLeft, setSecondsLeft } = useResendTimer(
    Number(params.resendInSeconds) || 0,
  );

  const onSubmit = (values: VerifyOtpFormValues) => {
    verifyOtp.mutate(
      { challengeId, code: values.code },
      {
        onSuccess: (data) => {
          setSession(data);
          router.navigate(getAuthDestination(true, data.user) as Href);
        },
        onError: (error) => {
          if (error instanceof AxiosError) {
            logger.error("status:", error.response?.status);
            logger.error("data:", error.response?.data);
          } else {
            logger.error("unexpected error:", error);
          }
          otpRef.current?.clear();
          showErrorToast({
            title: "Invalid or expired code",
            message:
              getErrorMessage(error) ?? "Please check the code and try again.",
          });
        },
      },
    );
  };

  const handleResend = () => {
    resendOtp.mutate(
      { challengeId },
      {
        onSuccess: (data) => {
          setChallengeId(data.challengeId);
          setSecondsLeft(data.resendInSeconds);
        },
        onError: (error) => {
          if (error instanceof AxiosError) {
            logger.error("status:", error.response?.status);
            logger.error("data:", error.response?.data);
          } else {
            logger.error("unexpected error:", error);
          }
          showErrorToast({
            title: "Couldn't resend code",
            message: "Check your number and try again.",
          });
        },
      },
    );
  };

  const desc = (
    <ThemedText type="bodyMd" className="mt-2 text-center" color="muted">
      Enter the code number we sent to{" "}
      <ThemedText type="bodyMd" weight="medium" className="mt-2" color="label">
        {params.phoneNumberMasked}
      </ThemedText>
    </ThemedText>
  );

  return (
    <AuthTemplate
      goBack
      title="Verification code"
      description={desc}
      buttonProps={{
        onPress: handleSubmit(onSubmit),
        disabled: !isValid,
        isLoading: verifyOtp.isPending,
      }}
    >
      <View className="gap-2">
        <StyledOtpInput
          ref={otpRef}
          numberOfDigits={Number(params.codeLength) || 4}
          onTextChange={(text) =>
            setValue("code", text, { shouldValidate: true })
          }
          onFilled={(text) => {
            setValue("code", text, { shouldValidate: true });
            handleSubmit(onSubmit)();
          }}
        />

        {errors.code && (
          <ThemedText type="bodySm" color="danger" className="text-center">
            {errors.code.message}
          </ThemedText>
        )}

        <ThemedText type="bodyMd" className="mt-2 text-center" color="muted">
          {secondsLeft > 0 ? (
            <>
              If you don't get the code, resend it in{" "}
              <ThemedText
                type="bodyMd"
                weight="medium"
                className="mt-2"
                color="label"
              >
                {secondsLeft}
              </ThemedText>{" "}
              seconds.
            </>
          ) : (
            "Didn't get the code?"
          )}
        </ThemedText>

        <ThemedButton
          label="Resend code"
          variant="tertiary"
          disabled={secondsLeft > 0 || resendOtp.isPending}
          onPress={handleResend}
        />
      </View>
    </AuthTemplate>
  );
};

export default VerifyScreen;
