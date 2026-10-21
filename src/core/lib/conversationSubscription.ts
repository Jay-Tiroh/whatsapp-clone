// core/lib/conversationSubscription.ts
import { getSocket } from "@/core/lib/socket";
import type { AckResponse } from "@/features/conversation/types/message.types";

export function subscribeToConversation(
  conversationId: string,
  onResult?: (ok: boolean) => void,
) {
  getSocket().emit(
    "presence.subscribe",
    { conversationId },
    (ack: AckResponse) => {
      if (!ack.ok) {
        console.warn("[realtime] subscribe failed:", conversationId, ack.error);
      }
      onResult?.(ack.ok);
    },
  );
}

export function unsubscribeFromConversation(conversationId: string) {
  getSocket().emit(
    "presence.unsubscribe",
    { conversationId },
    (ack: AckResponse) => {
      if (!ack.ok) {
        console.warn(
          "[realtime] unsubscribe failed:",
          conversationId,
          ack.error,
        );
      }
    },
  );
}
