import { createContext, useContext, useState, useEffect, useCallback } from "react";
import socket from "../socket";

const GameContext = createContext(null);

export function GameProvider({ children }) {
  const [room, setRoom] = useState(null);
  const [inGame, setInGame] = useState({});
  const [isFindingMatch, setIsFindingMatch] = useState(false);
  const [players, setPlayers] = useState([]);
  const [question, setQuestion] = useState();


  const leaveLobby = useCallback(() => {
    if (room?.roomId) {
      socket.emit("leave-room", { roomId: room.roomId });
      setRoom(null);
      socket.disconnect();
    }

    setInGame({});
    setIsFindingMatch(false);
  }, [room]);

  useEffect(() => {
    console.log("GameProvider mounted");
  }, []);


  return (
    <GameContext.Provider
      value={{
        room,
        setRoom,
        inGame,
        setInGame,
        isFindingMatch,
        setIsFindingMatch,
        leaveLobby,
        players,
        setPlayers,
        question,
        setQuestion,
        setPlayers
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  return useContext(GameContext);
}
