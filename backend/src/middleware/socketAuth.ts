import { Socket } from "socket.io";
import jwt from "jsonwebtoken";

interface CustomSocket extends Socket {
  user?: {
    id: string;
  };
}

const socketAuth = (socket: Socket, next: (err?: Error) => void) => {
  const customSocket = socket as CustomSocket;
  const token = customSocket.handshake.auth?.token;
  if (!token) {
    console.log("❌ No token received");
    return next(new Error("Authentication error"));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      id: string;
    };

    customSocket.user = decoded; // attach decoded user data
    console.log("✅ Authenticated user:", decoded.id);
    next();
  } catch (err: any) {
    console.log("❌ Invalid token:", err.message);
    next(new Error("Authentication error"));
  }
};

export default socketAuth;
