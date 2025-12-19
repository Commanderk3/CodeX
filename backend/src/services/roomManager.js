const Room = require("../models/Room");
const User = require("../models/User");
const questions = require("../../question2.json");

const {
  findRoomById,
  generateRoomCode,
  getActiveRooms,
  findplayerInRoom,
} = require("./gameManager");

// userId -> { socketId, roomId }
// playerName -> { socketId, roomId }
const activeSessions = new Map();

function getActiveSessions() {
  return activeSessions;
}

function isPlayerInRoom(room, playerName) {
  return room.players.some(p => p.playerName === playerName);
}

function isPlayerInAnotherRoom(userId) {
  if (activeSessions.has(userId)) {
    return false;
  };
  return true;
}

function validateUser(socket) {
  const userId = socket.user.id;
  const existingSocketId = activeSessions.get(userId);

  if (existingSocketId) {
    console.log(`Duplicate tab blocked for user ${userId}`);
    socket.emit("connection-rejected", {
      reason: "You already have an active session in another tab.",
    });
    console.log("exist");

    socket.disconnect(true);
    return false;
  }

  // first connection, roomId and playerName are filled by createRoom() and joinRoom()
  activeSessions.set(userId, {
    playerName: null,
    socketId: socket.id,
    roomId: null,
  });
  return true;
}

async function createRoom(creator, roomConfig, io) {
  const ROOM_AGE = 60 * 60 * 1000;
  const roomId = generateRoomCode();

  activeSessions.set(creator.socket.user.id, {
    playerName: creator.admin,
    socketId: creator.socket.id,
    roomId,
  });

  // stays in server
  const roomDetails = {
    roomId,
    roomName: roomConfig.roomName,
    difficulty: roomConfig.difficulty,
    maxPlayers: roomConfig.maxPlayers,
    players: [
      {
        playerName: creator.admin,
        avatar: creator.avatar,
        rating: creator.rating,
        isAdmin: true,
        isReady: false,
      },
    ],
    inGame: false,
    questionId: null, // keep it null when `inGame` is false
    gameResults: null, // store player's scores
    timerId: null,
  };

  // stored in DB
  const roomToSave = {
    roomId,
    roomName: roomConfig.roomName,
    difficulty: roomConfig.difficulty,
    maxPlayers: roomConfig.maxPlayers,
    playerCount: 1,
    isPrivate: false,
    password: null
  }

  await Room.create(roomToSave);
  getActiveRooms().push(roomDetails);
  creator.socket.join(roomId);
  io.to(creator.socket.id).emit("roomCreated", roomDetails);
  roomDetails.timerId = setTimeout(() => {
    killRoom(roomId, io);
  }, ROOM_AGE);
}

// use by other players to join a created room
// player = { socket, playerName, avatar, rating }
function joinRoom(roomId, player, io) {
  const room = findRoomById(roomId);
  console.log("Room before joining", room);

  // Register authoritative session
  activeSessions.set(player.socket.user.id, {
    playerName: player.playerName,
    socketId: player.socket.id,
    roomId,
  });

  if (!room) {
    console.log("Room not found!");
    return;
  }

  if (isPlayerInRoom(room, player.playerName)) {
    console.log("already in");
    return; // or emit error: "Player already in room"
  }

  if (isPlayerInAnotherRoom(player.socket.user.id)) {
    console.log("already in another room"); // ask them to disconnect
    return;
  }

  if (room.players.length < room.maxPlayers) {
    const safePlayer = {
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

function updateTestCaseInRoom(roomId, playerName, testCasePassed) {
  const room = findRoomById(roomId);
  if (!room) return;
}

async function killRoom(roomId, io) {
  const room = findRoomById(roomId);
  clearTimeout(room.timerId);
  const roomIndex = getActiveRooms().findIndex((r) => r.roomId === roomId);
  if (roomIndex !== -1) getActiveRooms().splice(roomIndex, 1);
  await Room.deleteOne({ roomId });
  console.log("Room ended");
  // disconnect sockets
}

async function removePlayerFromRoom(userId, roomId, io) {
  try {
    const activeSessions = getActiveSessions();
    console.log(activeSessions);
    const session = activeSessions.get(userId);
    const playerName = session.playerName;
    const activeRooms = getActiveRooms();
    if (!session) return;
    const room = findRoomById(roomId);
    if (!room) return;
    console.log(room);

    room.players = room.players.filter(p => p.playerName !== playerName);

    // io.to(roomId).emit("playerLeft", {
    //   playerName,
    //   players: room.players,
    // });

    console.log(`🧹 Removed ${playerName} from room ${roomId}`);

    if (room.players.length === 0) {
      console.log(`Deleting empty room: ${room.roomId}`);
      const index = activeRooms.indexOf(room);
      activeRooms.splice(index, 1);
      await Room.deleteOne({ roomId });
    }

    console.log("room after deleting player", room);

  } catch (err) {
    console.log(err);
  }

}

async function sendMessage(roomId, msg, player, socket) {
  socket.to(roomId).emit("broadcast-msg", { sender: player, message: msg });
}

async function toggleReady(roomId, isReady, playerName, io) {
  const room = findRoomById(roomId);
  if (!room) return;

  const player = findplayerInRoom(room, playerName);
  if (!player) return;

  player.isReady = isReady;

  io.to(roomId).emit("player-ready", { players: room.players });

  // check if all players ready
  const allReady =
    room.players.length >= 2 &&
    room.players.every((p) => p.isReady === true);

  if (allReady) {
    console.log("All ready! Sending question...");
    await sendQuestionToRoom(roomId, room, io);
  }
}

// admin can start game
// async function startGameInRoom(room) {
//   const startTime = Date.now();
//   const endTime = startTime + MATCH_DURATION;
//   const question = questions[2]; // depending uppon room.difficulty
//   const players = room.players;

//   // for each player store match history. A room can have any number of games/matches.
//   for (let idx = 0; idx < players.length; idx++) {
//     const p = players[idx];
//     const totalTestCases = question.test_cases.length;
//     let opponents = [];
//     opponents = players
//       .filter((_, i) => i !== idx)
//       .map((o) => ({
//         playerName: o.playerName,
//         avatar: o.avatar,
//         rating: o.rating,
//         testCasePassed: 0,
//         lastSubmittedTime: endTime,
//         timeTaken: 0,
//       }));

//     await User.findOneAndUpdate(
//       { username: p.playerName },
//       {
//         $push: {
//           matchHistory: {
//             roomId: room.roomId,
//             opponent: opponents,
//             result: "live",
//             totalTestCases,
//             testCasePassed: 0,
//             timeTaken: 0,
//             questionTitle: question.title,
//             createdAt: startTime, // let User schema stay same. matchHistory item = one game
//           },
//         },
//       }
//     );
//   }
// }

async function sendQuestionToRoom(roomId, room, io) {
  const difficulty = room.difficulty;

  let filtered = questions.filter((q) => q.difficulty === difficulty);
  if (filtered.length === 0) filtered = questions;

  const filteredIndx = 2 //Math.floor(Math.random() * filtered.length)
  const question = filtered[filteredIndx];
  room.inGame = true;
  room.questionId = question.problem_id; // problem id = question index

  const players = room.players;
  io.to(roomId).emit("question-delivered", { players, question });
}

module.exports = {
  createRoom,
  joinRoom,
  killRoom,
  sendMessage,
  toggleReady,
  getActiveSessions,
  removePlayerFromRoom,
  validateUser
};
