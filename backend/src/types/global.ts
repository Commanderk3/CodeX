import type { Socket } from "socket.io";

export interface CustomSocket extends Socket {
  user?: {
    id: string;
  };
}

export interface ClassicGame {
  type: "classic";
  roomId: string;
  createdAt: number;
  expiresAt: number;
  timerId: NodeJS.Timeout | null;
  questionId: number;
  players: ClassicPlayer[];
}

export interface ClassicPlayer {
  userId: string;
  playerName: string;
  avatar: string;
  rating: number;
  testCasePassed: number;
  lastSubmittedTime: number;
}

export type Difficulty = "Easy" | "Medium" | "Hard";

export interface Player {
  userId: string;
  playerName: string;
  avatar: string;
  rating: number;
  isAdmin: boolean;
  isReady: boolean;
}

export interface Winner {
  userId: string;
  testCasePassed: number;
}

export interface CustomRoom {
  type: "custom";
  roomId: string;
  roomName: string;
  difficulty: Difficulty;
  maxPlayers: number;
  totalTestCases: number | null;
  players: Player[];
  winners: Winner[];
  inGame: boolean;
  questionId: number | null;
  createdAt: Date | null;
  timerId: NodeJS.Timeout | null;
}

export interface Creator {
  socket: CustomSocket;
  admin: string;
  avatar: string;
  rating: number;
}

export interface NewPlayer {
  socket: CustomSocket;
  playerName: string;
  avatar: string;
  rating: number;
}

export type ActiveRoom = ClassicGame | CustomRoom;

interface WaitingQueueEntry {
  socket: Socket;
  playerName: string;
  avatar: string;
  rating: number;
}

type updateUserBody = {
  userId: string;
  username?: string;
  avatar?: string;
  language?: string;
};


export { WaitingQueueEntry, updateUserBody }