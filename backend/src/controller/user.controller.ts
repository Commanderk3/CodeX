import { Request, Response } from "express";
import updateUserProfile from "../services/updateUser.service";


const updateProfile = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const updatedUser = await updateUserProfile(req.user, req.body);

    res.status(200).json(updatedUser);
  } catch (err) {
    res.status(400).json({
      message: err instanceof Error ? err.message : "Update failed",
    });
  }
};

export default updateProfile;