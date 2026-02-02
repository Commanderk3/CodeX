import { Request, Response } from "express";
import { RegisterBody, LoginBody } from "../types/auth";
import { registerUser, loginUser } from "../services/auth.service";

const register = async (req: Request<{}, {}, RegisterBody>, res: Response) => {
  try {
    const { user, token } = await registerUser(req.body);
    res.status(201).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (err) {
    if (err instanceof Error && err.message === "User already exists") {
      console.error(err.message);
      return res.status(400).json({ message: err.message });
    }

    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const login = async (req: Request<{}, {}, LoginBody>, res: Response) => {
  try {
    const { user, token } = await loginUser(req.body);

    res.status(200).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (err) {
    if (
      err instanceof Error &&
      (err.message === "User not found" ||
        err.message === "Password do not match")
    ) {
      console.error(err.message);
      return res.status(401).json({ message: err.message });
    }

    console.error("❌ Login error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export { register, login };
