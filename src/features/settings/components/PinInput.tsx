import { View } from "react-native";

interface PinInputProps {
  pin: string;
}

export default function PinInput({ pin }: PinInputProps) {
  // Create an array of 4 slots to map over
  const pinSlots = [0, 1, 2, 3];

  return (
    <View className="w-full px-4 max-w-[240px] mx-auto flex-row justify-between items-center">
      {pinSlots.map((index) => {
        const isFilled = index < pin.length;
        const isFocused = index === pin.length;

        return (
          <View
            key={index}
            className={`w-8 h-8 rounded-full border-2 ${
              isFilled
                ? "bg-primary border-primary"
                : isFocused
                  ? "bg-transparent border-primary"
                  : "bg-transparent border-border"
            }`}
          />
        );
      })}
    </View>
  );
}
