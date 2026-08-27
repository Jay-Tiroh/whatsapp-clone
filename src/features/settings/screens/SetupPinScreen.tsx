import { usePinStore } from "@/core/store/pinStore";
import Keypad from "@/shared/components/CustomKeypad";
import PinInput from "@/shared/components/PinInput";
import Feather from "@expo/vector-icons/Feather";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { withUniwind } from "uniwind";

const StyledFeather = withUniwind(Feather);

type Stage = "enter" | "confirm";

export default function SetupPinScreen() {
  const router = useRouter();
  const setPin = usePinStore((s) => s.setPin);

  const [stage, setStage] = useState<Stage>("enter");
  const [firstPin, setFirstPin] = useState("");
  const [pin, setPinInput] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleBack = () => {
    if (stage === "confirm") {
      setStage("enter");
      setFirstPin("");
      setPinInput("");
      setError(null);
      return;
    }
    router.back();
  };

  const handleKeyPress = (value: string) => {
    if (pin.length >= 4) return;
    setError(null);

    const newPin = pin + value;
    setPinInput(newPin);

    if (newPin.length === 4) {
      if (stage === "enter") {
        setFirstPin(newPin);
        setStage("confirm");
        setPinInput("");
        return;
      }

      if (newPin === firstPin) {
        setPin(newPin);
        router.back();
      } else {
        setError("PINs don't match. Try again.");
        setStage("enter");
        setFirstPin("");
        setPinInput("");
      }
    }
  };

  const handleDelete = () => {
    setPinInput((prev) => prev.slice(0, -1));
  };

  return (
    <View className="p-safe-offset-6 gap-6 flex-1 bg-background">
      <Pressable
        onPress={handleBack}
        hitSlop={8}
        className="size-10 rounded-xl border-2 border-border flex items-center justify-center"
      >
        <StyledFeather
          name="chevron-left"
          size={24}
          colorClassName="accent-neutral-900 dark:accent-white/90"
        />
      </Pressable>
      <View className="gap-2 max-w-70 mx-auto p-6">
        <Text className="text-h4 font-display-bold text-neutral-900 dark:text-white/90 text-center">
          {stage === "enter" ? "Setup pin code" : "Confirm pin code"}
        </Text>
        <Text className="text-body-md font-display-regular text-neutral-300 dark:text-neutral-200 text-center">
          {error
            ? error
            : stage === "enter"
              ? "Make sure the code is safe and no one else knows."
              : "Re-enter your pin to confirm."}
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
