import { io, Socket } from "socket.io-client";
import { tokenStorage } from "./tokenStorage";

const SOCKET_URL = process.env.EXPO_PUBLIC_SOCKET_URL;

if (!SOCKET_URL) {
  throw new Error("EXPO_PUBLIC_SOCKET_URL is not configured");
}

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(`${SOCKET_URL}/chat`, {
      path: "/socket.io",
      transports: ["websocket"],
      autoConnect: false,
      auth: {
        token: tokenStorage.getAccessToken(),
      },
    });
  }

  return socket;
}

export function connectSocket() {
  const socket = getSocket();

  if (!socket.connected) {
    socket.connect();
  }

  return socket;
}

export function disconnectSocket() {
  if (!socket) {
    return;
  }

  socket.removeAllListeners();
  socket.disconnect();
  socket = null;
}

export function reconnectSocketWithNewToken() {
  disconnectSocket();

  const socket = getSocket();

  socket.connect();

  return socket;
}
