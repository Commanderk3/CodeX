import { Request, Response, Router } from "express";
import Room from "../models/Room";
const router = Router();

router.get("/", async (_req: Request, res: Response) => {
  try {
    const rooms = await Room.find();
    res.status(200).json(rooms);
  } catch (err) {
    if(err instanceof Error) {
      res.status(500).json({ message: err.message });
    }  
  }
});

export default router;
