import mongoose from "mongoose";

interface LeaderboardDocument {
  userId: mongoose.Types.ObjectId;
  username: string;
  avatar: string;
  rating: number;
}

const leaderboardSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },

    username: {
      type: String,
      required: true,
    },

    avatar: {
      type: String,
      default: "😀",
    },

    rating: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true },
);

leaderboardSchema.index({ userId: 1 }, { unique: true });

leaderboardSchema.index({ rating: -1 });

export default mongoose.model<LeaderboardDocument>(
  "Leaderboard",
  leaderboardSchema,
);
