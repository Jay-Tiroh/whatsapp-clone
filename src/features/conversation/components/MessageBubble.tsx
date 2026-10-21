import { useAuthStore } from "@/features/auth";
import { GroupParticipant } from "@/features/chats/types/conversation.types";
import { MessageStatus } from "@/features/conversation/utils/messageStatus";
import ThemedText from "@/shared/components/ThemedText";
import { formatTime } from "@/shared/utils/date";
import Ionicons from "@expo/vector-icons/Ionicons";
import { View } from "react-native";
import { withUniwind } from "uniwind";
import type { Message } from "../types/message.types";

type Props = {
  item: Message;
  status?: MessageStatus;
  isGroupConversation?: boolean;
  participants?: GroupParticipant[];
};

const StyledIonicons = withUniwind(Ionicons);

export default function MessageBubble({
  item,
  status = "sent",
  isGroupConversation = false,
  participants,
}: Props) {
  const myId = useAuthStore((state) => state.user?.id);
  const sentByMe = item.senderId === myId;
  const displayName = participants?.find(
    (p) => p.id === item.senderId,
  )?.displayName;
  return (
    <View className={sentByMe ? "items-end" : "items-start"}>
      <View
        className={`
          px-4
          py-2
          my-1
          rounded-2xl
          max-w-[75%]
          gap-1.5

          ${
            sentByMe
              ? "self-end bg-primary-400 rounded-br-none"
              : "self-start bg-white dark:bg-neutral-800 rounded-bl-none"
          }
        `}
      >
        {isGroupConversation && !sentByMe && (
          <ThemedText color="primary" weight="bold" type="bodySm" className="">
            {displayName}
          </ThemedText>
        )}
        <ThemedText className={sentByMe ? "text-white" : ""}>
          {item.text}
        </ThemedText>
      </View>
      <View className="flex-row items-center">
        {item.createdAt && (
          <ThemedText className="text-xs text-neutral-500 dark:text-neutral-400 px-1">
            {formatTime(item.createdAt)}
          </ThemedText>
        )}
        {sentByMe && status === "sent" && (
          <StyledIonicons
            name="checkmark-sharp"
            size={16}
            className="text-muted"
          />
        )}
        {sentByMe && status === "delivered" && (
          <StyledIonicons
            name="checkmark-done-sharp"
            size={16}
            className="text-muted"
          />
        )}
        {sentByMe && status === "read" && (
          <StyledIonicons
            name="checkmark-done-sharp"
            size={16}
            className="text-blue-300"
          />
        )}
      </View>
    </View>
  );
}
