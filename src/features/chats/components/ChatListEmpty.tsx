import { Text, View } from "react-native";

export default function ChatListEmpty() {
  return (
    <View className="flex-1 p-safe-offset-6 w-full">
      <Text className="text-h3 font-display-bold text-neutral-900 dark:text-white/90">
        Chats
      </Text>

      <View className="flex-1 items-center justify-center w-full max-w-82 m-auto">
        <View className="flex-row items-center w-full justify-center mb-4 ">
          {[1, 2, 3, 4].map((item, _) => (
            <View
              key={_}
              className="size-14 rounded-full bg-surface -ml-6 border border-border justify-center items-center"
            >
              {item === 4 && (
                <Text className="text-neutral-400 font-display-bold text-h6">
                  26+
                </Text>
              )}
            </View>
          ))}
        </View>
        <Text className="text-center text-muted font-display-regular text-body-md">
          <Text className="font-display-medium text-neutral-900 dark:text-white/90">
            Mom, Sir Slbert, Cody Fisher
          </Text>{" "}
          and 26+ contacts found on Chatme, try sending a message to them or
          just saying hello.
        </Text>
      </View>
    </View>
  );
}
