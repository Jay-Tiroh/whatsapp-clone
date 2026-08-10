import { useRef } from "react";
import { Keyboard, Pressable, StyleSheet, View } from "react-native";
import { OtpInput, OtpInputRef } from "react-native-otp-entry";
import { useCSSVariable } from "uniwind";

export default function StyledOtpInput() {
  const otpRef = useRef<OtpInputRef>(null);

  const [primary, surface, border, foreground, muted] = useCSSVariable([
    "--color-primary",
    "--color-surface",
    "--color-border",
    "--color-foreground",
    "--color-muted",
  ]);

  return (
    <View className="w-full px-4 my-6">
      {/* We use a relative wrapper to contain the absolute overlay */}
      <View className="relative w-full">
        <OtpInput
          ref={otpRef}
          numberOfDigits={6}
          focusColor={primary as string}
          onTextChange={(text) => console.log(text)}
          onFilled={(text) => console.log(`OTP is ${text}`)}
          theme={{
            containerStyle: styles.container,

            pinCodeContainerStyle: {
              ...styles.pinCodeContainer,
              backgroundColor: surface as string,
              borderColor: border as string,
            },

            pinCodeTextStyle: {
              ...styles.pinCodeText,
              color: foreground as string,
            },

            focusedPinCodeContainerStyle: {
              borderColor: primary as string,
              borderWidth: 2,
            },

            filledPinCodeContainerStyle: {
              borderColor: muted as string,
            },

            focusStickStyle: {
              backgroundColor: primary as string,
            },
          }}
        />

        {/*
          This transparent overlay sits on top of the cells AND gaps.
          It catches every tap and explicitly summons the keyboard.
        */}
        <Pressable
          className="absolute inset-0 z-10"
          onPress={() => {
            // If the keyboard was dismissed but the field thinks it's still focused,
            // a quick dismiss followed by focus forces the keyboard to reappear cleanly.
            Keyboard.dismiss();
            setTimeout(() => {
              otpRef.current?.focus();
            }, 10);
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    justifyContent: "space-between",
  },
  pinCodeContainer: {
    width: 48,
    height: 56,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  pinCodeText: {
    fontSize: 24,
    fontFamily: "SFProDisplay-Bold",
  },
});
