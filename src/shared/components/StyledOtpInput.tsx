import { forwardRef } from "react";
import { Keyboard, Pressable, StyleSheet, View } from "react-native";
import { OtpInput, OtpInputRef } from "react-native-otp-entry";
import { useCSSVariable } from "uniwind";

type StyledOtpInputProps = {
  onTextChange?: (text: string) => void;
  onFilled?: (text: string) => void;
  numberOfDigits?: number;
};

export default forwardRef<OtpInputRef, StyledOtpInputProps>(
  function StyledOtpInput({ onTextChange, onFilled, numberOfDigits = 6 }, ref) {
    const [primary, surface, border, foreground, muted] = useCSSVariable([
      "--color-primary",
      "--color-surface",
      "--color-border",
      "--color-foreground",
      "--color-muted",
    ]);

    return (
      <View className="w-full px-4 my-6 items-center">
        <View className="relative w-full">
          <OtpInput
            ref={ref}
            numberOfDigits={numberOfDigits}
            focusColor={primary as string}
            onTextChange={onTextChange}
            onFilled={onFilled}
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
          <Pressable
            className="absolute inset-0 z-10"
            onPress={() => {
              Keyboard.dismiss();
              setTimeout(() => {
                (ref as React.RefObject<OtpInputRef>)?.current?.focus();
              }, 10);
            }}
          />
        </View>
      </View>
    );
  },
);

const styles = StyleSheet.create({
  container: { width: "100%", justifyContent: "space-between" },
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
  pinCodeText: { fontSize: 24, fontFamily: "SFProDisplay-Bold" },
});
