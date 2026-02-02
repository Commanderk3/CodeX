import { Socket, Server } from "socket.io";
import {
  createRoom,
  joinRoom,
  sendMessage,
  toggleReady,
  startGameInRoom,
} from "../services/roomManager";
import { CustomSocket, Creator, NewPlayer } from "../types/global";
import { findPlayerSession } from "../state/activeSessions";
import getRating from "../services/queryUser.service";

const roomActions = (socket: CustomSocket, io: Server) => {
  socket.on("create-room", async ({ admin, avatar, roomConfig }) => {
    console.log(admin, avatar, roomConfig);
    const session = findPlayerSession(admin);

    if (session.exists) {
      console.log("Player is in room:", session.roomId);
      return;
    } 
    console.log("Player not in room");
  
    const rating: number | undefined = await getRating(admin);
    console.log(rating);
    if (rating !== undefined) {
      const creator: Creator = { socket, admin, avatar, rating };
      createRoom(creator, roomConfig, io);
    }
  });

  socket.on("join-room", async ({ roomId, playerName, avatar }) => {
    const session = findPlayerSession(playerName);

    if (session.exists) {
      console.log("Player is in room:", session.roomId);
      return;
    }
    console.log("Player not in room");
   
    const rating: number | undefined = await getRating(playerName);
    if (rating !== undefined) {
      const player: NewPlayer = { socket, playerName, avatar, rating };
      console.log("player that wants to join", socket.id);
      joinRoom(roomId, player, io);
    } else {
      console.log("User does not exist");
    }
  });

  socket.on("set-ready", ({ roomId, isReady }) => {
    if (!socket.user) return;
    toggleReady(roomId, socket.user.id, isReady, io);
  });

  socket.on("send-msg", ({ roomId, msg, player }) => {
    console.log(msg);
    sendMessage(roomId, msg, player, socket);
  });

  socket.on("start-game", ({ roomId, adminName }) => {
    startGameInRoom(roomId, adminName, io);
  });
};

export default roomActions;
