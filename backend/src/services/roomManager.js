const Room = require("../models/Room");
const User = require("../models/User");
const questions = require("../../question2.json");

const {
  findRoomById,
  generateRoomCode,
  getActiveRooms,
  findplayerInRoom,
} = require("./gameManager");

async function createRoom(creator, roomConfig, io) {
  const ROOM_AGE = 60 * 60 * 1000;
  const roomId = generateRoomCode();
  // no need to store avatar, rating, room history in server. store player name and current question
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
    gameResults: null, // store player's scores
    timerId: null,
  };

  const { gameResults, timerId, ...roomToSave } = roomDetails;
  await Room.create(roomToSave);
  getActiveRooms().push(roomDetails);
  creator.socket.join(roomId);
  io.to(creator.socket.id).emit("roomCreated", roomDetails);
  roomDetails.timerId = setTimeout(() => {
    killRoom(roomId, io);
  }, ROOM_AGE);
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
}

// use by other players to join a created room
function joinRoom(roomId, player, io) {
  const room = findRoomById(roomId);
  if (!room) {
    console.log("Room not found!");
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

    setTimeout(() => {
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
    }, 100);

    console.log("sent!", roomId);
  } else {
    console.log("Room is full");
  }
}

// admin can start game
async function startGameInRoom(room) {
  const startTime = Date.now();
  const endTime = startTime + MATCH_DURATION;
  const question = questions[2]; // depending uppon room.difficulty
  const players = room.players;

  for (let idx = 0; idx < players.length; idx++) {
    const p = players[idx];
    const totalTestCases = question.test_cases.length;
    let opponents = [];
    opponents = players
      .filter((_, i) => i !== idx)
      .map((o) => ({
        playerName: o.playerName,
        avatar: o.avatar,
        rating: o.rating,
        testCasePassed: 0,
        lastSubmittedTime: endTime,
        timeTaken: 0,
      }));

    await User.findOneAndUpdate(
      { username: p.playerName },
      {
        $push: {
          matchHistory: {
            roomId: room.roomId,
            opponent: opponents,
            result: "live",
            totalTestCases,
            testCasePassed: 0,
            timeTaken: 0,
            questionTitle: question.title,
            createdAt: startTime, // let User schema stay same. matchHistory item = one game
          },
        },
      }
    );
  }
}

async function notifyDisconnection(socketId) {
  const activeRooms = getActiveRooms();
  const room = activeRooms.find((r) =>
    r.players.some((p) => p.socketId === socketId)
  );

  if (!room) return;

  const disconnectedPlayer = room.players.find((p) => p.socketId === socketId);

  room.players = room.players.filter((p) => p.socketId !== socketId);
  if (!room.players.length === 2) {
    io.to(room.roomId).emit("player-disconnected", {
      playerName: disconnectedPlayer.playerName,
      remainingPlayers: room.players,
    });
  }

  if (room.players.length === 0) {
    console.log(`Deleting empty room: ${room.roomId}`);
    const index = activeRooms.indexOf(room);
    activeRooms.splice(index, 1);
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
  io.to(roomId).emit("player-ready", { players: room.players }); // use socket to exclude sender
}

module.exports = {
  createRoom,
  joinRoom,
  startGameInRoom,
  killRoom,
  sendMessage,
  toggleReady,
  notifyDisconnection,
};
