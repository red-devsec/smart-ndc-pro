import { Server as HTTPServer } from "http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "smartndc-jwt-secret-2026";

export function createSocketServer(httpServer: HTTPServer): Server {
  const io = new Server(httpServer, {
    cors: { origin: "*", methods: ["GET", "POST"] },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || (socket.handshake.query?.token as string);
    if (!token) return next(new Error("Token requis"));
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string; role: string };
      (socket as any).user = decoded;
      next();
    } catch {
      next(new Error("Token invalide"));
    }
  });

  io.on("connection", (socket) => {
    const user = (socket as any).user;
    console.log(`Socket connecté: ${socket.id} (${user?.email || "inconnu"})`);

    if (user?.role) {
      socket.join(`role:${user.role}`);
    }

    socket.on("subscribe:employee", (employeeId: string) => {
      socket.join(`employee:${employeeId}`);
    });

    socket.on("disconnect", () => {
      console.log(`Socket déconnecté: ${socket.id}`);
    });
  });

  return io;
}
