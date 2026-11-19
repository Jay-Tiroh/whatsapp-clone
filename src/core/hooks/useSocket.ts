import { connectSocket, getSocket } from "@/core/lib/socket";
import { useAuthStore } from "@/features/auth";
import { showErrorToast } from "@/shared/hooks/showToast";
import { logger } from "@/shared/utils/logger";
import { useEffect, useState } from "react";

/**
 * Owns the socket connection for the signed-in session. Mounted once at the app
 * root, so a restored session connects without opening a conversation.
 */
export function useSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) {
      setIsConnected(false);
      setError(null);
      return;
    }

    const socket = getSocket();

    const onConnect = () => {
      logger.log("[socket] connected", socket.id);

      setIsConnected(true);
      setError(null);
    };

    const onDisconnect = (reason: string) => {
      logger.log("[socket] disconnected:", reason);

      setIsConnected(false);
    };

    const onConnectError = (err: Error) => {
      logger.error("[socket] connection error:", err);

      setIsConnected(false);
      setError(err.message);

      showErrorToast({
        title: "Socket connection error",
        message: err.message,
      });
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("connect_error", onConnectError);

    connectSocket();

    // Handle the case where the socket was already connected
    // before this effect registered its listeners.
    if (socket.connected) {
      onConnect();
    }

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("connect_error", onConnectError);
    };
  }, [isAuthenticated]);

  return {
    isConnected,
    error,
  };
}
