import User from "../models/User";

async function getRating(username: string): Promise<number | undefined> {
  const user = await User.findOne({ username })
    .select("rating")
    .lean();

  return user?.rating;
}

export default getRating;
