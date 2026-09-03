import { ReceiptPayload } from "@/features/conversation/screens/ConversationScreen";
import { Message } from "@/features/conversation/types/message.types";

export type MessageStatus = "sent" | "delivered" | "read";

export function getMessageStatus(
  message: Message,
  otherUserReceipt: ReceiptPayload | null,
): MessageStatus {
  if (!otherUserReceipt) return "sent";

  const messageTime = new Date(message.createdAt).getTime();

  if (otherUserReceipt.read) {
    const readTime = new Date(otherUserReceipt.read.at).getTime();
    if (messageTime <= readTime) return "read";
  }

  if (otherUserReceipt.delivered) {
    const deliveredTime = new Date(otherUserReceipt.delivered.at).getTime();
    if (messageTime <= deliveredTime) return "delivered";
  }

  return "sent";
}
