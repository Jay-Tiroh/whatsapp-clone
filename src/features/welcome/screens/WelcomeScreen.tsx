import { Text, View } from "react-native";

export default function WelcomeScreen() {
  return (
    // Replaced StyleSheet with Uniwind utility classes
    <View className="flex-1 justify-center items-center">
      <Text className=" font-display-semibold mb-4 text-primary text-title2">
        Welcome to WhatsApp
      </Text>

      {/* Removed the restrictive w-5 wrapper */}
      <View></View>
    </View>
  );
}
