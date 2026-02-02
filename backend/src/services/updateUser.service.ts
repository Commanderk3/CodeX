import User from "../models/User";
import Leaderboard from "../models/Leaderboard";
import { updateUserBody } from "../types/global";

const updateUserProfile = async (userId: string, data: updateUserBody) => {
  if (data.username) {
    const existingUser = await User.findOne({
      username: data.username,
      _id: { $ne: userId },
    });

    if (existingUser) {
      throw new Error("Username already exists");
    }
  }

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    {
      $set: {
        ...(data.username && { username: data.username }),
        ...(data.avatar && { avatar: data.avatar }),
        ...(data.language && { language: data.language }),
      },
    },
    { new: true },
  );

  Leaderboard.findOneAndUpdate(
  { userId },
  {
    $set: {
      username: data.username,
      avatar: data.avatar
    },
  }
);


  if (!updatedUser) {
    throw new Error("User not found");
  }

  return updatedUser;
};

export default updateUserProfile;
