import { ActiveRoom, ClassicGame, ClassicPlayer, CustomRoom } from "../types/global";

let activeRooms: ActiveRoom[] = [];

function getActiveRooms(): ActiveRoom[] {
  return activeRooms;
}

function setActiveRooms(rooms: ActiveRoom[]) {
  activeRooms = rooms;
}

function findRoomById(roomId: string): ClassicGame | CustomRoom | undefined {
  const room = activeRooms.find((r) => r.roomId === roomId) as ClassicGame | undefined;
  return room;
}

function findplayerInRoom(room: ClassicGame | CustomRoom, userId: string) {
  return room.players.find((p) => p.userId === userId);
}

export { getActiveRooms, setActiveRooms, findRoomById, findplayerInRoom };
