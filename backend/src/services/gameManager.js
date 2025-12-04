const User = require("../models/User");
const questions = require("../../question2.json");
const { matchResults } = require("./matchResults");


let activeRooms = [];
const MATCH_DURATION = 60 * 1000;

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

function generateRoomCode() {
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  const timePart = Date.now().toString(36).substring(4, 8).toUpperCase();
  return random + timePart;
}

function createClassicGame(player1, player2, io) {
  const roomId = generateRoomCode();
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
    const totalTestCases = room.question.test_cases.length;
    await User.findOneAndUpdate(
      { username: p.playerName },
      {
        $push: {
          matchHistory: {
            roomId,
            opponent: opponent,
            result: "live",
            totalTestCases: totalTestCases,
            testCasePassed: 0,
            timeTaken: 0,
            opponentTestCasePassed: 0,
            opponentTimeTaken: 0,
            questionTitle: question.title,
            createdAt: startTime,
          },
        },
      }
    );
  });

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
    question: questions[2],
    createdAt: startTime,
    expiresAt: endTime,
  });

  room.timerId = setTimeout(() => {
    endGame(roomId, io);
  }, MATCH_DURATION);
  return room;
}

// function sendRoomDetails(roomObj, roomId, io) {
//   const playersForClient = roomObj.players.map((player) => ({
//     playerName: player.playerName,
//     avatar: player.avatar,
//     testCasePassed: player.testCasePassed || 0,
//   }));

//   io.to(roomId).emit("matchFound", {
//     roomId,
//     players: playersForClient,
//     question: roomObj.question,
//     createdAt: roomObj.createdAt,
//     expiresAt: roomObj.expiresAt,
//   });
// }

function rejoinGame(socket, roomId, playerName) {
  const room = findRoomById(roomId);
  if (!room) return false;

  const player = findplayerInRoom(room, playerName);
  if (!player) return false;

  socket.join(roomId);

  const playersForClient = room.players.map((p) => ({
    playerName: p.playerName,
    avatar: p.avatar,
    testCasePassed: p.testCasePassed || 0,
  }));

  socket.emit("rejoin-success", {
    roomId,
    players: playersForClient,
    question: room.question,
    createdAt: room.createdAt,
    expiresAt: room.expiresAt,
  });

  console.log(`${playerName} rejoined room ${roomId}`);
  return true;
}

async function endGame(roomId, io) {
  const room = findRoomById(roomId);
  if (!room) return;

  const totalTestCases = room.question.test_cases.length;
  let results = {};

  if (room.players.length === 2) {
    results = matchResults(
      room.players[0],
      room.players[1],
      room.createdAt,
      totalTestCases
    );
  } else {
    room.players.forEach((p) => {
      const opponents = room.players
        .filter((o) => o.playerName !== p.playerName)
        .map((o) => ({
          playerName: o.playerName,
          testCasePassed: o.testCasePassed || 0,
          timeTaken: 0,
        }));

      results[p.playerName] = {
        ...p,
        testCasePassed: p.testCasePassed || 0,
        timeTaken: 0,
        won: false,
        draw: false,
        opponents,
        rating: p.rating,
      };
    });
  }

  console.log(`Game ended in room ${roomId}:`, results);

  io.to(roomId).emit("gameEnd", { result: results, createdAt: room.createdAt });

  try {
    for (const p of room.players) {
      const playerResult = results[p.playerName];
      if (!playerResult) continue;

      const opponents = room.players
        .filter((o) => o.playerName !== p.playerName)
        .map((o) => ({
          playerName: o.playerName,
          avatar: o.avatar,
          testCasePassed: results[o.playerName]?.testCasePassed || 0,
          timeTaken: results[o.playerName]?.timeTaken || 0,
        }));

      await User.findOneAndUpdate(
        {
          username: p.playerName,
          "matchHistory.roomId": roomId,
        },
        {
          $set: {
            "matchHistory.$": {
              roomId,
              opponents,
              result: playerResult.won
                ? "victory"
                : playerResult.draw
                ? "draw"
                : "defeat",
              totalTestCases,
              testCasePassed: playerResult.testCasePassed,
              timeTaken: playerResult.timeTaken,
              questionTitle: room.question.title,
              createdAt: room.createdAt,
            },
            rating: playerResult.rating,
          },
        }
      );
    }
  } catch (err) {
    console.error("Error updating user ratings:", err);
  }

  clearTimeout(room.timer);
  const roomIndex = activeRooms.findIndex((r) => r.roomId === roomId);
  if (roomIndex !== -1) activeRooms.splice(roomIndex, 1);
}

// async function endGame(roomId, io) {
//   const room = findRoomById(roomId);
//   if (!room) return;
//   const totalTestCases = room.question.test_cases.length;
//   const result = matchResults(
//     room.players[0],
//     room.players[1],
//     room.createdAt,
//     totalTestCases
//   );

//   console.log(`Game ended in room ${roomId}:`, result);

//   /*
// result = {
//   player1: {
//     timeTaken: 12.34,
//     rating: 807,
//     testCasePassed: 0.9,
//     lastSubmittedTime: 1759251087088,
//     won: true,
//     draw: false
//   },
//   player2: {
//     timeTaken: 15.67,
//     rating: 796,
//     testCasePassed: 0.6,
//     lastSubmittedTime: 1759251087088,
//     won: false,
//     draw: false
//   }
// }
// */

//   io.to(roomId).emit("gameEnd", { result, createdAt: room.createdAt });

//   try {
//     // Player 1
//     await User.findOneAndUpdate(
//       {
//         username: room.players[0].playerName,
//         "matchHistory.roomId": roomId,
//       },
//       {
//         $set: {
//           "matchHistory.$": {
//             roomId: roomId,
//             opponent: room.players[1].playerName,
//             result: result.player1.won
//               ? "victory"
//               : result.player1.draw
//               ? "draw"
//               : "defeat",
//             totalTestCases: totalTestCases,
//             testCasePassed: result.player1.testCasePassed,
//             timeTaken: result.player1.timeTaken,
//             opponentTestCasePassed: result.player2.testCasePassed,
//             opponentTimeTaken: result.player2.timeTaken,
//             questionTitle: room.question.title,
//             createdAt: room.createdAt,
//           },
//           rating: result.player1.rating,
//         },
//       }
//     );

//     // Player 2
//     await User.findOneAndUpdate(
//       {
//         username: room.players[1].playerName,
//         "matchHistory.roomId": roomId,
//       },
//       {
//         $set: {
//           "matchHistory.$": {
//             roomId: roomId,
//             opponent: room.players[0].playerName,
//             result: result.player2.won
//               ? "victory"
//               : result.player2.draw
//               ? "draw"
//               : "defeat",
//             totalTestCases: totalTestCases,
//             testCasePassed: result.player2.testCasePassed,
//             timeTaken: result.player2.timeTaken,
//             opponentTestCasePassed: result.player1.testCasePassed,
//             opponentTimeTaken: result.player1.timeTaken,
//             questionTitle: room.question.title,
//             createdAt: room.createdAt,
//           },
//           rating: result.player2.rating,
//         },
//       }
//     );
//   } catch (err) {
//     console.error("Error updating user ratings:", err);
//   }

//   clearTimeout(room.timer);
//   const roomIndex = activeRooms.findIndex((room) => room.id === roomId);
//   if (roomIndex !== -1) {
//     activeRooms.splice(roomIndex, 1);
//   }
// }

function updateTestCase(roomId, playerName, testCasePassed) {
  const room = findRoomById(roomId);
  if (!room) return;
  const player = findplayerInRoom(room, playerName);
  if (!player) return;
  player.testCasePassed = Math.max(testCasePassed, player.testCasePassed);
  player.lastSubmittedTime = Date.now();
  console.log(room.players);
}

function handlePlayerWin(roomId, io) {
  const room = findRoomById(roomId);
  if (!room) return;
  clearTimeout(room.timerId);
  endGame(roomId, io);
}

module.exports = {
  createClassicGame,
  rejoinGame,
  endGame,
  handlePlayerWin,
  getActiveRooms,
  setActiveRooms,
  generateRoomCode,
  updateTestCase,
  findRoomById,
  findplayerInRoom
};
