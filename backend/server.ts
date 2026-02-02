import express, { Request, Response } from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";

import { Server, Socket } from "socket.io";

dotenv.config();

// routes
import authRoutes from "./src/routes/auth.routes";
import userRoutes from "./src/routes/user.routes";
import roomRoutes from "./src/routes/rooms.routes";
import LeaderboardRoutes from "./src/routes/leaderboard.routes";

import auth from "./src/middleware/auth";
import socketAuth from "./src/middleware/socketAuth";

// sockets
import matchMaking from "./src/sockets/matchMaking";
import { submitCode } from "./src/sockets/submitCode";
import roomActions from "./src/sockets/roomSockets";

// socketManager
import { cleanSession, getActiveSessions } from "./src/state/activeSessions";
import { validateUser } from "./src/services/roomManager";

interface CustomSocket extends Socket {
  user?: {
    id: string;
  };
}

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const PORT = 5000;

app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI as string)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));

app.use("/api/auth", authRoutes);
app.use("/api/user", auth, userRoutes);
app.use("/api/roomlist", auth, roomRoutes);
app.use("/api/leaderboard", auth, LeaderboardRoutes);

app.get("/activeUsers", (_req: Request, res: Response) => {
  console.log(getActiveSessions());
  res.status(201).json({ activeUsers: `${getActiveSessions()}` });
});

// Routes
app.get("/", (_req: Request, res: Response) => {
  res.send("Hello player!");
});

io.use(socketAuth);

io.on("connection", (socket: CustomSocket) => {
  if (!socket.user) {
    console.log("❌ No user data found on socket");
    return;
  }

  const userId = socket.user.id;
  console.log("New client connected", socket.id, userId);

  if (!validateUser(socket, io)) return;
  matchMaking(socket, io);
  submitCode(socket, io);
  roomActions(socket, io);

  socket.on("disconnect", () => cleanSession(userId, socket));
});

server.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
