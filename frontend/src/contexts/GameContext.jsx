import { createContext, useContext, useState, useEffect, useCallback } from "react";
import socket from "../socket";

const GameContext = createContext(null);

export function GameProvider({ children }) {
  const [room, setRoom] = useState(null);
  const [inGame, setInGame] = useState({});
  const [isFindingMatch, setIsFindingMatch] = useState(false);
  const [players, setPlayers] = useState([]);
  const [question, setQuestion] = useState();

  const leaveLobby = useCallback((roomId, username) => {
    if (room?.roomId) {
      socket.emit("leave-room", { roomId: roomId,  playerName: username });
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
        setQuestion
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  return useContext(GameContext);
}
