import express, { Request, Response } from "express";
import User from "../models/User";
import auth from "../middleware/auth";
import updateProfile from "../controller/user.controller";

const router = express.Router();

router.get("/me", auth, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await User.findById(req.user).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (err) {
    if (err instanceof Error) {
      console.error(err.message);
      return res.status(500).json({ message: err.message });
    }

    res.status(500).json({ message: "Server error" });
  }
});

router.post("/profile", auth, updateProfile);

export default router;
