import { useAuthStore } from "@/features/auth";
import { GroupParticipant } from "@/features/chats/types/conversation.types";
import { MessageStatus } from "@/features/conversation/utils/messageStatus";
import ThemedText from "@/shared/components/ThemedText";
import { formatTime } from "@/shared/utils/date";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Image } from "expo-image";
import { Pressable, View } from "react-native";
import { withUniwind } from "uniwind";
import type { LocalDeliveryState, Message } from "../types/message.types";
// Props:
type Props = {
  item: Message;
  status?: MessageStatus;
  delivery?: LocalDeliveryState;
  onRetry?: () => void;
  isGroupConversation?: boolean;
  participants?: GroupParticipant[];
  onDiscard?: () => void;
};

const StyledIonicons = withUniwind(Ionicons);

export default function MessageBubble({
  item,
  status = "sent",
  isGroupConversation = false,
  participants,
  delivery,
  onRetry,
  onDiscard,
}: Props) {
  const myId = useAuthStore((state) => state.user?.id);
  const sentByMe = item.senderId === myId;
  const displayName = participants?.find(
    (p) => p.id === item.senderId,
  )?.displayName;
  const image = item.attachments.find((a) => a.type === "image");
  const ratio =
    image?.width && image?.height
      ? Math.min(Math.max(image.width / image.height, 0.6), 1.6)
      : 1;
  const statusLabel =
    delivery === "pending"
      ? "Sending"
      : status === "read"
        ? "Read"
        : status === "delivered"
          ? "Delivered"
          : "Sent";
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
          ${delivery === "pending" ? "opacity-70" : ""}
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
        {image && (
          <Image
            source={{ uri: image.url }}
            style={{ width: 220, aspectRatio: ratio, borderRadius: 12 }}
            contentFit="cover"
            transition={150}
            accessibilityLabel={sentByMe ? "Photo you sent" : "Photo"}
          />
        )}
        {!!item.text && (
          <ThemedText className={sentByMe ? "text-white" : ""}>
            {item.text}
          </ThemedText>
        )}
      </View>

      <View className="flex-row items-center">
        {item.createdAt && (
          <ThemedText className="text-xs text-neutral-500 dark:text-neutral-400 px-1">
            {formatTime(item.createdAt)}
          </ThemedText>
        )}

        {sentByMe && delivery === "pending" && (
          <View accessible accessibilityLabel={statusLabel}>
            <StyledIonicons
              name="time-outline"
              size={16}
              className="text-muted"
            />
          </View>
        )}

        {sentByMe && delivery === "failed" && (
          <Pressable
            onPress={onRetry}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Message not sent. Double tap to retry."
            className="flex-row items-center gap-1"
          >
            <StyledIonicons
              name="alert-circle"
              size={16}
              className="text-red-500"
            />
            <ThemedText className="text-xs text-red-500">
              Not sent · Tap to retry
            </ThemedText>
          </Pressable>
        )}
        {sentByMe && delivery === "failed" && onDiscard && (
          <Pressable
            onPress={onDiscard}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Discard unsent message"
            className="ml-3"
          >
            <ThemedText className="text-xs text-neutral-500 dark:text-neutral-400">
              Discard
            </ThemedText>
          </Pressable>
        )}
        {sentByMe && !delivery && (
          <View accessible accessibilityLabel={statusLabel}>
            <StyledIonicons
              name={
                status === "sent" ? "checkmark-sharp" : "checkmark-done-sharp"
              }
              size={16}
              className={status === "read" ? "text-blue-300" : "text-muted"}
            />
          </View>
        )}
      </View>
    </View>
  );
}
