const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema({
  roomId: { type: String, required: true, unique: true },
  roomName: { type: String, required: true },
  difficulty: { type: String, required: true },
  maxPlayers: { type: Number, required: true },
  players: { type: Array, default: [] },
  gameResults: { type: Object, default: null },
  isPrivate: { type: Boolean, default: false },
  password: { type: String },
});

module.exports = mongoose.model("Room", roomSchema);
