import * as Haptics from "expo-haptics";
import React from "react";
import { Pressable, Text, View } from "react-native";

interface KeypadProps {
  onPress: (value: string) => void;
  onDelete: () => void;
  leftBottomSlot?: React.ReactNode;
}

const Keypad: React.FC<KeypadProps> = ({
  onPress,
  onDelete,
  leftBottomSlot,
}) => {
  const padRows = [
    ["1", "2", "3"],
    ["4", "5", "6"],
    ["7", "8", "9"],
  ];

  const handlePress = (key: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress(key);
  };

  const handleDelete = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onDelete();
  };

  return (
    <View className="flex-col items-center justify-center w-full px-8 gap-y-6">
      {padRows.map((row, rowIndex) => (
        <View key={rowIndex} className="flex-row justify-between w-full">
          {row.map((key) => (
            <Pressable
              key={key}
              onPress={() => handlePress(key)}
              className="w-20 h-20 items-center justify-center rounded-full bg-surface border border-border active:bg-neutral-100 dark:active:bg-neutral-800"
            >
              <Text className="text-h2 font-display-medium text-foreground">
                {key}
              </Text>
            </Pressable>
          ))}
        </View>
      ))}

      <View className="flex-row justify-between w-full">
        <View className="w-20 h-20 items-center justify-center">
          {leftBottomSlot}
        </View>

        <Pressable
          onPress={() => handlePress("0")}
          className="w-20 h-20 items-center justify-center rounded-full bg-surface border border-border active:bg-neutral-100 dark:active:bg-neutral-800"
        >
          <Text className="text-h2 font-display-medium text-foreground">0</Text>
        </Pressable>

        <Pressable
          onPress={handleDelete}
          className="w-20 h-20 items-center justify-center rounded-full active:bg-neutral-100 dark:active:bg-neutral-800"
        >
          <Text className="text-body-lg font-display-bold text-muted">DEL</Text>
        </Pressable>
      </View>
    </View>
  );
};

export default Keypad;
