import { Socket, Server } from "socket.io";
import { createClassicGame, rejoinGame } from "../services/gameManager";
import { findPlayerSession } from "../state/activeSessions";
import { CustomSocket, WaitingQueueEntry } from "../types/global";
import getRating from "../services/queryUser.service";
import { sendMessageToPlayer } from "../utils/systemMessage";

let waitingQueue: WaitingQueueEntry[] = [];

const matchMaking = (socket: CustomSocket, io: Server) => {
  socket.on("find-match", async({ playerName, avatar }) => {
    // prevent same user from joining twice
    if (socket.user === undefined) return;
    if (waitingQueue.some((entry) => entry.socket.user?.id === socket.user?.id)) {
      console.log("Duplicate user detected");
      sendMessageToPlayer(io, socket, "error", "Duplicate user detected");
      socket.disconnect(true);
      return;
    }

    const session = findPlayerSession(playerName);

    if (session.exists) {
      console.log("Player is in room:", session.roomId);
      return;
    }

    console.log("Player not in room");

    const rating = await getRating(playerName);
    if (rating === undefined) {
      console.log("Could not find rating of this player");
      return;
    }

    waitingQueue.push({ socket, playerName, avatar, rating });
    if (waitingQueue.length >= 2) {
      const player1 = waitingQueue.shift()!;
      const player2 = waitingQueue.shift()!;
      createClassicGame(player1, player2, io);
    }
  });

  socket.on("cancel-match", ({ playerName }) => {
    waitingQueue = waitingQueue.filter(
      (entry) => entry.playerName !== playerName,
    );
    socket.disconnect(true);
  });

  socket.on("rejoin", ({ roomId }) => {
    if (socket.user === undefined) return;
    rejoinGame(socket, roomId);
  });

  socket.on("disconnect", () => {
    waitingQueue = waitingQueue.filter(
      (entry) => entry.socket.id !== socket.id,
    );
  });
};

export default matchMaking;
