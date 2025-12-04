const { createRoom, joinRoom, sendMessage, toggleReady } = require("../services/roomManager");

const roomActions = (socket, io) => {
  // create & join
  socket.on("create-room", ({ admin, avatar, rating, roomConfig }) => {
    const creator = { socket, admin, avatar, rating };
    createRoom(creator, roomConfig, io);
  });

  socket.on("join-room", ({ roomId, playerName, avatar, rating }) => {
    const player = { socket, playerName, avatar, rating };
    console.log("player that wants to join", socket.id);
    joinRoom(roomId, player, io);
  });

  // for sync between client and server, bool is sent
  socket.on("set-ready", ({ roomId, isReady, player}) => {
    toggleReady(roomId, isReady, player, io);
  });

  // messages
  socket.on("send-msg", ({ roomId, msg, player }) => {
    console.log(msg);
    sendMessage(roomId, msg, player, socket);
  });
};

module.exports = { roomActions };
