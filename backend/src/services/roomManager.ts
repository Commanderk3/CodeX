import { Server, Socket } from "socket.io";
import Room from "../models/Room";
import questions from "../../question2.json";
import {
  CustomRoom,
  Player,
  Creator,
  NewPlayer,
  Winner,
} from "../types/global";
import {
  findRoomById,
  getActiveRooms,
  findplayerInRoom
  
} from "../state/activeRooms";
import {
  getActiveSessions,
  isPlayerInAnotherRoom,
} from "../state/activeSessions";
import { generateRoomCode } from "../utils/roomCode";
import { sendMessageToPlayer } from "../utils/systemMessage";
import { updateGameResultsInRoom } from "../repositories/result.repository";

interface CustomSocket extends Socket {
  user?: {
    id: string; // FIX ME: string or number?
  };
}

function isEveryoneReady(players: Player[]): boolean {
  return players
    .filter((player) => !player.isAdmin) // ignore admin
    .every((player) => player.isReady === true);
}

function validateUser(socket: CustomSocket, io: Server): boolean {
  if (!socket.user) {
    console.log("User not found");
    return false;
  }
  const activeSessions = getActiveSessions();
  const userId = socket.user.id;
  const existingSocketId = activeSessions.get(userId);

  if (existingSocketId) {
    console.log(`Duplicate tab blocked for user ${userId}`);
    socket.disconnect(true);
    return false;
  }
  return true;
}

async function createRoom(creator: Creator, roomConfig, io: Server) {
  const ROOM_AGE = 5 * 60 * 1000;
  const roomId = generateRoomCode();
  try {
    if (!creator.socket.user) return;

    getActiveSessions().set(creator.socket.user.id, {
      playerName: creator.admin,
      socketId: creator.socket.id,
      roomId,
    });

    // stays in server
    const roomDetails: CustomRoom = {
      type: "custom",
      roomId,
      roomName: roomConfig.roomName,
      difficulty: roomConfig.difficulty,
      maxPlayers: roomConfig.maxPlayers,
      totalTestCases: null, // FIX ME: are we updating this value later
      players: [
        {
          userId: creator.socket.user.id,
          playerName: creator.admin,
          avatar: creator.avatar,
          rating: creator.rating,
          isAdmin: true,
          isReady: false,
        },
      ],
      winners: [], // [{playerName, testCasePassed}, {2}, {3}] store winners of current game. Gets clear after game is ended
      inGame: false,
      questionId: null, // current questionId. keep it null when `inGame` is false
      createdAt: null,
      timerId: null,
    };

    // stored in DB
    const roomToSave = {
      roomId,
      roomName: roomConfig.roomName,
      difficulty: roomConfig.difficulty,
      maxPlayers: roomConfig.maxPlayers,
      gameResults: [],
      playerCount: 1,
      isPrivate: false,
      password: null,
    };

    await Room.create(roomToSave);
    getActiveRooms().push(roomDetails);
    creator.socket.join(roomId);
    io.to(creator.socket.id).emit("roomCreated", roomDetails);

    roomDetails.timerId = setTimeout(() => {
      killRoom(roomId);
    }, ROOM_AGE);
  } catch (err) {
    console.log(err);
  }
}

// use by other players to join a created room
// player = { socket, playerName, avatar, rating }
function joinRoom(roomId: string, player: NewPlayer, io: Server) {
  const room = findRoomById(roomId) as CustomRoom;
  // Register authoritative session
  if (!player.socket.user) return;
  getActiveSessions().set(player.socket.user.id, {
    playerName: player.playerName,
    socketId: player.socket.id,
    roomId,
  });

  if (!room) {
    console.log("Room not found!");
    return;
  }

  if (findplayerInRoom(room, player.socket.user.id)) {
    console.log("already in");
    sendMessageToPlayer(
      io,
      player.socket.id,
      "warning",
      "Player already in this room",
    );
    return;
  }

  if (isPlayerInAnotherRoom(player.socket.user.id)) {
    console.log("already in another room"); // ask them to disconnect
    sendMessageToPlayer(
      io,
      player.socket.id,
      "warning",
      "Player already in another room",
    );
    return;
  }

  if (room.players.length < room.maxPlayers) {
    const safePlayer = {
      userId: player.socket.user.id,
      playerName: player.playerName,
      avatar: player.avatar,
      rating: player.rating,
      isReady: false,
      isAdmin: false,
    };

    room.players.push(safePlayer);
    player.socket.join(roomId);

    io.to(player.socket.id).emit("roomJoinSuccess", {
      roomId,
      roomName: room.roomName,
      difficulty: room.difficulty,
      maxPlayers: room.maxPlayers,
      players: room.players,
    });

    player.socket.to(roomId).emit("newPlayerJoined", {
      newPlayer: player.playerName,
      players: room.players,
    });

    console.log("sent!", roomId);
  } else {
    console.log("Room is full");
  }
}

function updateTestCaseInRoom(roomId: string, userId: string, testCasePassed: number) {
  const room = findRoomById(roomId) as CustomRoom;
  if (!room) return;
  console.log(room);

  if (!room.totalTestCases) throw new Error("total test cases not updated");

  const TOTAL_TEST_CASES: number = room.totalTestCases;
  const winners: Winner[] = room.winners;

  // Find existing index
  const idx = winners.findIndex((w) => w.userId === userId);

  // If player already completed → do nothing
  if (idx !== -1 && winners[idx].testCasePassed === TOTAL_TEST_CASES) {
    return;
  }

  // Remove old entry if exists
  if (idx !== -1) {
    winners.splice(idx, 1);
  }

  const updated = { userId, testCasePassed };

  // Split locked and active players
  const locked: Winner[] = []; // FIX ME: Winner[] name is misleading even though type is same
  const active: Winner[] = [];

  for (const w of winners) {
    if (w.testCasePassed === TOTAL_TEST_CASES) {
      locked.push(w);
    } else {
      active.push(w);
    }
  }

  // Add updated player to correct section
  if (testCasePassed === TOTAL_TEST_CASES) {
    locked.push(updated); // 🔒 lock at first completion
  } else {
    active.push(updated);
  }

  // Sort only active players
  active.sort((a, b) => b.testCasePassed - a.testCasePassed);

  // Rebuild leaderboard
  room.winners = [...locked, ...active];
}

async function killRoom(roomId) {
  const room = findRoomById(roomId) as CustomRoom;
    if (!room) {
    return;
  }

  if (room.timerId) {
    clearTimeout(room.timerId);
    room.timerId = null;
  }

  const roomIndex = getActiveRooms().findIndex((r) => r.roomId === roomId);
  if (roomIndex !== -1) getActiveRooms().splice(roomIndex, 1);
  await Room.deleteOne({ roomId });
  console.log("Room ended :", roomId);
}

async function removePlayerFromRoom(userId: string, roomId: string) {
  try {
    const activeSessions = getActiveSessions();
    const session = activeSessions.get(userId);
    if (!session) return;
    const playerName = session.playerName;
    const room = findRoomById(roomId);
    if (!room) return;

    if (room.type === "classic") return; // classic game player cannot join again

    room.players = room.players.filter((p) => p.playerName !== playerName);

    console.log(`🧹 Removed ${playerName} from room ${roomId}`);

    if (room.players.length === 0) {
      console.log(`Deleting empty room: ${room.roomId}`);
      killRoom(roomId);
    }

    console.log("room after deleting player", room);
  } catch (err) {
    console.log(err);
  }
}

// FIX ME: add msg object
async function sendMessage(
  roomId: string,
  msg,
  player: string,
  socket: Socket,
) {
  socket.to(roomId).emit("broadcast-msg", { sender: player, message: msg });
}

async function toggleReady(
  roomId: string,
  userId: string,
  isReady: boolean,
  io: Server,
) {
  const room = findRoomById(roomId) as CustomRoom;
  if (!room) return;

  const player = findplayerInRoom(room, userId) as Player;
  if (!player) return;

  player.isReady = isReady;

  io.to(roomId).emit("player-ready", { players: room.players });

  console.log(player.playerName, "is", isReady);

  // check if all players ready
  const allReady: boolean =
    room.players.length >= 2 && room.players.every((p) => p.isReady === true);

  if (allReady) {
    console.log("All ready! Sending question...");
    await sendQuestionToRoom(roomId, room, io);
  }
}

function startGameInRoom(roomId: string, adminName: string, io: Server) {
  const room = findRoomById(roomId) as CustomRoom;
  const players = room.players;
  const adminPlayer = players.find((player: Player) => player.isAdmin === true);
  if (!adminPlayer) return;

  if (adminPlayer.playerName === adminName && isEveryoneReady(players)) {
    sendQuestionToRoom(roomId, room, io);
  } else {
    console.log("Player is not the admin");
  }
}

async function sendQuestionToRoom(
  roomId: string,
  room: CustomRoom,
  io: Server,
) {
  if (room.inGame === true) {
    console.log("room already in game");
    return; // already in game
  }
  const difficulty = room.difficulty;

  let filtered = questions.filter((q) => q.difficulty === difficulty);
  if (filtered.length === 0) filtered = questions;

  const filteredIndx = 1; //Math.floor(Math.random() * filtered.length)
  const question = filtered[filteredIndx];
  room.inGame = true;
  room.questionId = question.problem_id; // problem id = question index
  room.totalTestCases = question.test_cases.length;

  const players = room.players;
  io.to(roomId).emit("question-delivered", { players, question });

  let matchDuration = 60 * 1000; // Easy, 5 min
  if (question.difficulty === "Medium") matchDuration = 5 * 60 * 1000;
  if (question.difficulty === "Hard") matchDuration = 5 * 60 * 1000;

  room.timerId = setTimeout(() => {
    endRoomGame(roomId, io);
  }, matchDuration);
}

async function endRoomGame(roomId: string, io: Server) {
  const room = findRoomById(roomId) as CustomRoom;
  if (!room) {
    throw new Error("Room not found");
  }
  const leaderboard = room.winners;
  const questionId = room.questionId;
  if (!questionId) return;
  const questionName = questions[questionId].title;
  room.winners = []; // reset
  room.questionId = null;
  room.inGame = false;
  room.players = room.players.map((p: Player) => ({
    ...p,
    isReady: false,
  }));
  io.to(roomId).emit("roomGameEnd", { leaderboard, createdAt: room.createdAt });
  await updateGameResultsInRoom(room, roomId, questionName, leaderboard);
}

export {
  createRoom,
  joinRoom,
  killRoom,
  sendMessage,
  toggleReady,
  getActiveSessions,
  removePlayerFromRoom,
  validateUser,
  updateTestCaseInRoom,
  endRoomGame,
  startGameInRoom,
};
