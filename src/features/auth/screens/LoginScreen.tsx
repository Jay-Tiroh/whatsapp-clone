// LoginScreen.tsx

import { TextInput, View } from "react-native";
import AuthTemplate from "../components/Template";

const LoginScreen = () => {
  return (
    <AuthTemplate
      title="What's your phone number?"
      description="We will send you the verification code."
    >
      <View className="flex-1">
        <TextInput className="border border-gray-300 rounded-md p-2" />
      </View>
    </AuthTemplate>
  );
};
export default LoginScreen;
