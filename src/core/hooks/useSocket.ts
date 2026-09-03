import { connectSocket, getSocket } from "@/core/lib/socket";
import { showErrorToast } from "@/shared/hooks/showToast";
import { useEffect, useState } from "react";

export function useSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const socket = getSocket();

    const onConnect = () => {
      console.log("[socket] connected", socket.id);

      setIsConnected(true);
      setError(null);
    };

    const onDisconnect = (reason: string) => {
      console.log("[socket] disconnected:", reason);

      setIsConnected(false);
    };

    const onConnectError = (err: Error) => {
      console.error("[socket] connection error:", err);

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
  }, []);

  return {
    isConnected,
    error,
  };
}
