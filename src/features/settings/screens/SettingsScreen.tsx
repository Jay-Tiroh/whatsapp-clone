import { useLogout } from "@/features/auth";
import ThemedButton from "@/shared/components/ThemedButton";
import { Alert, View } from "react-native";

export default function SettingsScreen() {
  const { mutate: logout, isPending } = useLogout();

  const handleLogoutPress = () => {
    Alert.alert(
      "Log out",
      "Are you sure you want to log out?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Log out",
          style: "destructive",
          onPress: () => logout(),
        },
      ],
      { cancelable: true },
    );
  };

  return (
    <View className="flex-1 justify-center items-center">
      <ThemedButton
        variant="secondary"
        isLoading={isPending}
        onPress={handleLogoutPress}
        label="Log out"
      />
    </View>
  );
}
