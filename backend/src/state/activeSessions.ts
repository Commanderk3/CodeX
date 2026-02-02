import { Socket, Server } from "socket.io";
import { removePlayerFromRoom } from "../services/roomManager";

// userId -> { socketId, roomId }
// playerName -> { socketId, roomId }
interface ActiveSession {
  playerName: string | null;
  socketId: string;
  roomId: string | null;
}

const activeSessions = new Map<string, ActiveSession>();

function getActiveSessions(): Map<string, ActiveSession> {
  return activeSessions;
}

function isPlayerInAnotherRoom(userId: string): boolean {
  if (activeSessions.has(userId)) {
    return false;
  }
  return true;
}

function cleanSession(userId: string, socket: Socket) {
  const session = activeSessions.get(userId);
  if (!session) return;
  if (session.socketId === socket.id) {
    if (session.roomId) {
      removePlayerFromRoom(userId, session.roomId);
      activeSessions.delete(userId);
    }
  }
  console.log("Client disconnected:", socket.id, "user:", userId);
}

function findPlayerSession(playerName: string) {
  for (const session of activeSessions.values()) {
    if (session.playerName === playerName) {
      return {
        exists: true,
        roomId: session.roomId,
      };
    }
  }

  return {
    exists: false,
    roomId: null,
  };
}

function deleteSessionAndDisconnect(io: Server, playerName: string): boolean {
  for (const [key, session] of activeSessions.entries()) {
    if (session.playerName === playerName) {
      const socket = io.sockets.sockets.get(session.socketId);

      if (socket) {
        socket.disconnect(true); // force disconnect
      }

      activeSessions.delete(key);
      return true;
    }
  }

  return false;
}

export {
  getActiveSessions,
  isPlayerInAnotherRoom,
  cleanSession,
  findPlayerSession,
  deleteSessionAndDisconnect,
};
