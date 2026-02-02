import { Request, Response, Router } from "express";
import Leaderboard from "../models/Leaderboard";
const router = Router();

router.get("/", async (_req: Request, res: Response) => {
  try {
    const leaderboard = await Leaderboard.find();
    res.status(200).json(leaderboard);
  } catch (err) {
    if(err instanceof Error) {
      res.status(500).json({ message: err.message });
    }  
  }
});

export default router;
