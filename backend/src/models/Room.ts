import mongoose from "mongoose";

interface RoomDocument extends mongoose.Document {
  roomId: string;
  roomName: string;
  difficulty: string;
  maxPlayers: number;
  playerCount: number;
  isPrivate: boolean;
  password?: string;
}

const roomSchema = new mongoose.Schema<RoomDocument>({
  roomId: { type: String, required: true, unique: true },
  roomName: { type: String, required: true },
  difficulty: { type: String, required: true },
  maxPlayers: { type: Number, required: true },
  playerCount: { type: Number, required: true  },
  isPrivate: { type: Boolean, default: false },
  password: { type: String },
});

export default mongoose.model<RoomDocument>("Room", roomSchema);
