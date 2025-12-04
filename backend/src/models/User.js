const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    avatar: { type: String, default: "😀" },
    language: { type: String, default: "JavaScript" },
    rating: { type: Number, default: 0 },

    matchHistory: [
      {
        roomId: { type: String, required: true },
        opponents: [
          {
            playerName: { type: String, required: true },
            avatar: { type: String },
            testCasePassed: { type: Number, required: true },
            timeTaken: { type: Number, required: true },
          },
        ],
        result: { type: String },
        totalTestCases: { type: Number, required: true },
        testCasePassed: { type: Number, required: true },
        questionTitle: { type: String, required: true },
        completedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
