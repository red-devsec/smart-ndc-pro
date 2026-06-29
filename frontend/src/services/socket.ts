import { io, Socket } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:3001";
const SOCKET_PATH = import.meta.env.VITE_SOCKET_PATH || "/socket.io";

let socket: Socket | null = null;

export function connectSocket(token: string): Socket {
  if (socket?.connected) {
    return socket;
  }

  socket = io(SOCKET_URL, {
    path: SOCKET_PATH,
    auth: { token },
    transports: ["websocket"],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
  });

  socket.on("connect", () => {
    console.log("Socket connecté");
  });

  socket.on("disconnect", (reason) => {
    console.log("Socket déconnecté:", reason);
  });

  socket.on("connect_error", (err) => {
    console.error("Erreur socket:", err.message);
  });

  return socket;
}

export function getSocket(): Socket | null {
  return socket;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
}

export function subscribeToEvent(
  event: string,
  callback: (...args: unknown[]) => void
): () => void {
  socket?.on(event, callback);
  return () => {
    socket?.off(event, callback);
  };
}
