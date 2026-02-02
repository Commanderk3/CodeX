import Leaderboard from "../models/Leaderboard";

async function updateLeaderboard(
  userId: string,
  username: string,
  avatar: string,
  rating: number,
) {
  await Leaderboard.findOneAndUpdate(
    { userId },
    {
      $set: {
        username,
        avatar,
        rating,
      },
    },
    { upsert: true },
  );

}

export default updateLeaderboard;
