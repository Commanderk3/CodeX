const User = require("../models/User");
const questions = require("../../question2.json");
const { matchResults } = require("./matchResults");

let activeRooms = [];
const MATCH_DURATION = 15 * 1000;

function getActiveRooms() {
  return activeRooms;
}

function setActiveRooms(rooms) {
  activeRooms = rooms;
}

function findRoomById(roomId) {
  return activeRooms.find((r) => r.roomId === roomId);
}

function findplayerInRoom(room, playerName) {
  return room.players.find((p) => p.playerName === playerName);
}

function createRoom(player1, player2, io) {
  const roomId = `room-${player1.playerName}-${player2.playerName}`;
  player1.socket.join(roomId);
  player2.socket.join(roomId);
  const question = questions[2];
  const startTime = Date.now();
  const endTime = startTime + MATCH_DURATION;
  const room = {
    roomId: roomId,
    createdAt: startTime,
    expiresAt: endTime,
    timerId: null,
    question: question,
    players: [
      {
        playerName: player1.playerName,
        rating: player1.rating,
        testCasePassed: 0,
        lastSubmittedTime: endTime,
      },
      {
        playerName: player2.playerName,
        rating: player2.rating,
        testCasePassed: 0,
        lastSubmittedTime: endTime,
      },
    ],
  };

  activeRooms.push(room);
  console.log(`Room created: ${roomId}`);

  [player1, player2].forEach(async (p, idx) => {
    const opponent = idx === 0 ? player2.playerName : player1.playerName;
    await User.findOneAndUpdate(
      { username: p.playerName },
      {
        $push: {
          matchHistory: {
            roomId,
            opponent,
            result: "live",
            createdAt: startTime,
            expiresAt: endTime,
          },
        },
      }
    );
  });

  io.to(roomId).emit("matchFound", {
    roomId,
    players: [
      { playerName: player1.playerName, avatar: player1.avatar },
      { playerName: player2.playerName, avatar: player2.avatar },
    ],
    question: questions[2],
  });

  room.timerId = setTimeout(() => {
    endGame(roomId, io);
  }, MATCH_DURATION);
  console.log("Timer started for room:", room.timerId);
  return room;
}

function endGame(roomId, io) {
  const room = findRoomById(roomId);
  if (!room) return;
  const totalTestCases = room.question.test_cases.length;
  // call matchResult to calcuite new ratings and update DB
  const result = matchResults(room.players[0], room.players[1], room.createdAt, totalTestCases);

  console.log(`Game ended in room ${roomId}:`, result);

  /*
{
  player1: {
    timeTaken: 12.34,
    rating: 807,
    testCasePassed: 0.9,
    lastSubmittedTime: 1759251087088,
    won: true,
    draw: false
  },
  player2: {
    timeTaken: 15.67,
    rating: 796,
    testCasePassed: 0.6,
    lastSubmittedTime: 1759251087088,
    won: false,
    draw: false
  }
}
*/ 

  io.to(roomId).emit("gameEnd", { result,  createdAt: room.createdAt });
  clearTimeout(room.timer);
  const roomIndex = activeRooms.findIndex((room) => room.id === roomId);
  if (roomIndex !== -1) {
    activeRooms.splice(roomIndex, 1);
  }
  activeRooms.splice(roomIndex, 1);
}

function updateTestCase(roomId, playerName, testCasePassed) {
  const room = findRoomById(roomId);
  if (!room) return;
  const player = findplayerInRoom(room, playerName);
  if (!player) return;
  player.testCasePassed = testCasePassed;
  player.lastSubmittedTime = Date.now();
}

function handlePlayerWin(roomId, io, playerName) {
  const room = findRoomById(roomId);
  if (!room) return;
  // stop timer
  clearTimeout(room.timerId);
  // end match logic (update DB, emit result, etc.)
  endGame(roomId, io, playerName);
}

module.exports = {
  createRoom,
  handlePlayerWin,
  getActiveRooms,
  setActiveRooms,
  updateTestCase,
};
