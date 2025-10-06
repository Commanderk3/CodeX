const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    // Extra profile info
    avatar: { type: String, default: "😀" },
    language: { type: String, default: "JavaScript" },
    rating: { type: Number, default: 0 },

    // Example match history schema
    matchHistory: [
      {
        roomId: { type: String },
        opponent: { type: String },      // opponent username/email
        result: { type: String },        // "win" | "loss" | "draw" | "live"
        createdAt: { type: Date },
        expiresAt: { type: Date }        // match expiration time
      }
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
