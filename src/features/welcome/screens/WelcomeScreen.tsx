import ThemedText from "@/shared/components/ThemedText";
import { Image, View } from "react-native";

export default function WelcomeScreen() {
  return (
    // Replaced StyleSheet with Uniwind utility classes
    <View className="flex-1 justify-center items-center">
      <ThemedText className="text-accent-dark mb-4 text-xl font-bold">
        Welcome to WhatsApp
      </ThemedText>

      {/* Removed the restrictive w-5 wrapper */}
      <View>
        <Image
          source={require("@/assets/images/welcome-doodle.png")}
          resizeMode="contain"
          // Uniwind allows you to style the Image directly with className
          className="w-[500px] h-[500px]"
        />
      </View>
    </View>
  );
}
