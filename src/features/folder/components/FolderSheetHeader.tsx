import ThemedText from "@/shared/components/ThemedText";
import { View } from "react-native";

const Header = ({ title, stage }: { title: string; stage: 1 | 2 }) => {
  return (
    <View className=" pt-safe  justify-center w-full gap-3 max-h-40">
      <View className="h-full max-h-13 px-6 w-full">
        <ThemedText
          type="bodyXl"
          weight="bold"
          className="text-white/90 flex-1 text-center capitalize"
        >
          {title}
        </ThemedText>
        <View className="flex-row w-full true-center gap-2">
          <View className="w-1/2 h-2 rounded-full bg-primary-400" />
          <View
            className={`w-1/2 h-2 rounded-full ${stage === 2 ? " bg-primary-400" : "bg-neutral-500"}`}
          />
        </View>
      </View>
    </View>
  );
};

export default Header;
