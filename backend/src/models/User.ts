import mongoose from "mongoose";

// interfaces
interface MatchHistory {
  roomId: string;
  opponents: Opponents[];
  result?: string;
  totalTestCases: number;
  testCasePassed: number;
  questionTitle: string;
  completedAt: Date;
}

interface Opponents {
  playerName: string;
  avatar: string;
  testCasePassed: number;
  timeTaken: number;
}

interface LeaderboardEntry {
  playerName: string;
  testCasePassed: number;
}

interface GameResult {
  questionName: string;
  leaderboard: LeaderboardEntry[];
}

interface RoomMatchHistory {
  roomId: string;
  roomName: string;
  createdAt: Date;
  gameResults: GameResult[];
}

interface UserDocument extends mongoose.Document {
  username: string;
  email: string;
  password: string;
  avatar: string;
  language: string;
  rating: number;
  matchHistory: MatchHistory[];
  roomMatchHistory: RoomMatchHistory[];
}

const userSchema = new mongoose.Schema<UserDocument>(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    avatar: { type: String, default: "frog" },
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

    roomMatchHistory: [
      {
        roomId: { type: String, required: true },
        roomName: { type: String, required: true },
        createdAt: { type: Date, required: true },
        gameResults: {
          type: [
            {
              questionName: { type: String, required: true },

              leaderboard: {
                type: [
                  {
                    playerName: { type: String, required: true },
                    testCasePassed: { type: Number, required: true },
                  },
                ],
                default: [],
              },
            },
          ],
          default: [],
        },
      },
    ],
  },
  { timestamps: true },
);

export default mongoose.model<UserDocument>("User", userSchema);
