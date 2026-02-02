import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User";
import { RegisterBody, LoginBody } from "../types/auth";


const JWT_SECRET = process.env.JWT_SECRET as string;

const registerUser = async (data: RegisterBody) => {
  const existingUser = await User.findOne({ email: data.email });
  if (existingUser) {
    throw new Error("User already exists");
  }
  const hashedPassword = await bcrypt.hash(data.password, 10);
  const user = await User.create({
    ...data,
    password: hashedPassword,
  });
  const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "48h" });
  return { user, token };
};

const loginUser = async (data: LoginBody) => {
  const { email, password } = data;
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("User not found");
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("Password do not match");
  }
  const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "48h" });
  return { user, token };
};

export { registerUser, loginUser };
