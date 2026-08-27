import { usePinStore } from "@/core/store/pinStore";
import Keypad from "@/shared/components/CustomKeypad";
import PinInput from "@/shared/components/PinInput";
import { useState } from "react";
import { Text, View } from "react-native";

export default function PinLockScreen() {
  const verifyPin = usePinStore((s) => s.verifyPin);
  const unlock = usePinStore((s) => s.unlock);

  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);

  const handleKeyPress = (value: string) => {
    if (pin.length >= 4) return;
    setError(false);

    const newPin = pin + value;
    setPin(newPin);

    if (newPin.length === 4) {
      if (verifyPin(newPin)) {
        unlock();
      } else {
        setError(true);
        setPin("");
      }
    }
  };

  const handleDelete = () => setPin((prev) => prev.slice(0, -1));

  return (
    <View className="absolute inset-0 z-50 p-safe-offset-6 gap-6 flex-1 bg-background">
      <View className="gap-2 max-w-70 mx-auto p-6 mt-12">
        <Text className="text-h4 font-display-bold text-neutral-900 dark:text-white/90 text-center">
          Enter your pin
        </Text>
        <Text className="text-body-md font-display-regular text-neutral-300 dark:text-neutral-200 text-center">
          {error ? "Incorrect pin, try again." : "Welcome back."}
        </Text>
      </View>
      <View className="mt-4">
        <PinInput pin={pin} />
      </View>
      <View className="mt-auto pb-6">
        <Keypad onPress={handleKeyPress} onDelete={handleDelete} />
      </View>
    </View>
  );
}
