import questions from "../../question2.json";
import { matchResults } from "./matchResults";
import { Server } from "socket.io";
import {
  ClassicGame,
  ClassicPlayer,
  CustomSocket,
  WaitingQueueEntry,
} from "../types/global";
import { generateRoomCode } from "../utils/roomCode";
import {
  getActiveRooms,
  findRoomById,
  findplayerInRoom,
} from "../state/activeRooms";

import {
  getActiveSessions,
  deleteSessionAndDisconnect,
} from "../state/activeSessions";
import {
  updateClassicGameResults,
  addGametoUserProfile,
} from "../repositories/result.repository";
import updateLeaderboard from "../repositories/rating.repository";

const MATCH_DURATION = 5 * 60 * 1000;

function createClassicGame(player1, player2, io: Server) {
  const roomId = generateRoomCode();
  player1.socket.join(roomId);
  player2.socket.join(roomId);
  const startTime = Date.now();
  const endTime = startTime + MATCH_DURATION;

  const questionIndx = 2; //Math.floor(Math.random() * questions.length)

  const question = {
    ...questions[questionIndx],
    test_cases: questions[questionIndx].test_cases.slice(0, 3),
  };

  const activeSessions = getActiveSessions();

  activeSessions.set(player1.socket.user.id, {
    playerName: player1.playerName,
    socketId: player1.socket.id,
    roomId,
  });

  activeSessions.set(player2.socket.user.id, {
    playerName: player2.playerName,
    socketId: player2.socket.id,
    roomId,
  });

  const room: ClassicGame = {
    type: "classic",
    roomId: roomId,
    createdAt: startTime,
    expiresAt: endTime,
    timerId: null,
    questionId: question.problem_id,
    players: [
      {
        userId: player1.socket.user.id,
        playerName: player1.playerName,
        avatar: player1.avatar,
        rating: player1.rating,
        testCasePassed: 0,
        lastSubmittedTime: endTime,
      },
      {
        userId: player2.socket.user.id,
        playerName: player2.playerName,
        avatar: player2.avatar,
        rating: player2.rating,
        testCasePassed: 0,
        lastSubmittedTime: endTime,
      },
    ],
  };

  getActiveRooms().push(room);
  console.log(`Room created: ${roomId}`);

  addGametoUserProfile(room.players, roomId, question, startTime);

  io.to(roomId).emit("matchFound", {
    roomId,
    players: [
      {
        playerName: player1.playerName,
        avatar: player1.avatar,
        testCasePassed: 0,
      },
      {
        playerName: player2.playerName,
        avatar: player2.avatar,
        testCasePassed: 0,
      },
    ],
    question,
    expiresAt: endTime,
  });

  room.timerId = setTimeout(() => {
    endClassicGame(roomId, io);
  }, MATCH_DURATION);
  return room;
}

function rejoinGame(socket: CustomSocket, roomId: string) {
  const room = findRoomById(roomId) as ClassicGame;
  if (!room) return false;

  if (socket.user === undefined) return;

  const userId = socket.user.id;

  const player = findplayerInRoom(room, userId);
  if (!player) {
    console.log("Did not found player");
    return false;
  }

  const question = questions[room.questionId];

  socket.join(roomId);

  const playersForClient = room.players.map((p) => ({
    playerName: p.playerName,
    avatar: p.avatar,
    testCasePassed: p.testCasePassed,
  }));

  socket.emit("rejoin-success", {
    roomId,
    players: playersForClient,
    question: question,
    expiresAt: room.expiresAt,
  });

  console.log(`${userId} rejoined room ${roomId}`);
  return true;
}

async function endClassicGame(roomId: string, io: Server) {
  const room = findRoomById(roomId) as ClassicGame;
  console.log("room", room);
  if (!room) return;
  if (!room.questionId) return;

  const question = questions[room.questionId];
  const totalTestCases = question.test_cases.length;
  const player1 = room.players[0];
  const player2 = room.players[1];
  let results = {};

  results = matchResults(player1, player2, room.createdAt, totalTestCases);
  console.log("RESULT", results);

  console.log(`Game ended in room ${roomId}:`, results);
  io.to(roomId).emit("gameEnd", { result: results, createdAt: room.createdAt });

  if (room.timerId) {
    clearTimeout(room.timerId);
  }

  const activeRooms = getActiveRooms();
  const roomIndex = activeRooms.findIndex((r) => r.roomId === roomId);
  if (roomIndex !== -1) activeRooms.splice(roomIndex, 1);

  deleteSessionAndDisconnect(io, player1.playerName);
  deleteSessionAndDisconnect(io, player2.playerName);

  try {
    await updateClassicGameResults(roomId, room, question, results);
  } catch (err) {
    console.error("Error updating user profiles:", err);
  }

  try {
    await Promise.all([
      updateLeaderboard(
        player1.userId,
        player1.playerName,
        player1.avatar,
        results[player1.userId].rating,
      ),
      updateLeaderboard(
        player2.userId,
        player2.playerName,
        player2.avatar,
        results[player2.userId].rating,
      ),
    ]);
  } catch (err) {
    console.error("Error updating user ratings", err);
  }
}

function updateTestCase(
  roomId: string,
  userId: string,
  testCasePassed: number,
  resultStatus,
  io: Server,
) {
  const room = findRoomById(roomId) as ClassicGame;
  if (!room) return;
  const player = findplayerInRoom(room, userId) as ClassicPlayer;
  if (!player) return;
  try {
    player.testCasePassed = Math.max(testCasePassed, player.testCasePassed);
    player.lastSubmittedTime = Date.now();
    if (resultStatus) handlePlayerWin(roomId, io);
    console.log(room.players);
  } catch (err) {
    if (err instanceof Error) console.error(err);
  }
}

function handlePlayerWin(roomId, io) {
  const room = findRoomById(roomId);
  if (!room) return;
  if (room.timerId) {
    clearTimeout(room.timerId);
  }
  endClassicGame(roomId, io);
}

export {
  createClassicGame,
  rejoinGame,
  endClassicGame,
  handlePlayerWin,
  updateTestCase,
};
