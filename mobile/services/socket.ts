import { io, Socket } from "socket.io-client";
import { SOCKET_URL } from "../config";

let socket: Socket | null = null;

type EventCallback = (...args: any[]) => void;

/**
 * Connect to the backend Socket.io server with JWT auth.
 * Reuses existing connection if already connected.
 */
export function connectSocket(token: string): Socket {
  if (socket?.connected) return socket;

  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ["websocket"],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
  });

  socket.on("connect", () => console.log("Socket connecté"));
  socket.on("disconnect", (reason) =>
    console.log("Socket déconnecté:", reason)
  );
  socket.on("connect_error", (err) =>
    console.log("Erreur socket:", err.message)
  );

  return socket;
}

/** Get current socket instance */
export function getSocket(): Socket | null {
  return socket;
}

/** Disconnect and clean up */
export function disconnectSocket(): void {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
    console.log("Socket déconnecté");
  }
}

/** Register a listener for a socket event */
export function onEvent(event: string, callback: EventCallback): void {
  socket?.on(event, callback);
}

/** Remove a specific listener */
export function offEvent(event: string, callback?: EventCallback): void {
  socket?.off(event, callback);
}
