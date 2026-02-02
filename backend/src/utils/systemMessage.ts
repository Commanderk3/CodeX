import { Socket, Server } from "socket.io";
import { CustomSocket } from "../types/global";

function sendMessageToPlayer(
  io: Server,
  socket: string | CustomSocket,
  type: string,
  message: string,
) {
  if (typeof socket === "string") {
    io.to(socket).emit("systemMessage", { type, message });
  } else {
    socket.emit("systemMessage", { type, message });
  }
}

export { sendMessageToPlayer };