const { createClassicGame, rejoinGame } = require("../services/gameManager");
// const { createRoom, joinRoom } = require("../services/roomSockets");
let waitingQueue = [];
const matchMaking = (socket, io) => {
  socket.on("find-match", ({ playerName, avatar, rating }) => {
    if (!waitingQueue.some((entry) => entry.playerName === playerName)) {
      waitingQueue.push({ socket, playerName, avatar, rating });
    } else {
      socket.disconnect(true);
      console.log("Duplicate user detected"); // move this check ahead so one user cannot have two sockets
    }
    if (waitingQueue.length >= 2) {
      const player1 = waitingQueue.shift();
      const player2 = waitingQueue.shift();
      createClassicGame(player1, player2, io);
    }
  });

  // socket.on("create-room", ({ admin, avatar, rating, roomConfig }) => {
  //   const creator = { socket, admin, avatar, rating };
  //   createRoom(creator, roomConfig, io);
  // })

  // socket.on("join-room", ({ roomId, playerName, avatar, rating }) => {
  //   const player = { socket, playerName, avatar, rating };
  //   joinRoom(roomId, player, io);
  // })

  socket.on("cancel-match", ({ playerName }) => { 
    waitingQueue = waitingQueue.filter((entry) => entry.playerName !== playerName);
    socket.disconnect(true);
    console.log("Waiting Queue:", waitingQueue);
  });
  
  socket.on("rejoin", ({ username, roomId }) => {
    rejoinGame(socket, roomId, username);
  });
  
  socket.on("disconnect", () => {
    waitingQueue = waitingQueue.filter(
      (entry) => entry.socket.id !== socket.id
    );
  });
};

module.exports = { matchMaking };
