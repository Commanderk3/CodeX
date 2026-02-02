import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useGame } from "../contexts/GameContext";
import { useUser } from "../contexts/UserContext";
import Chat from "../components/ChatWindow/Chat";
import socket from "../socket";

import PlayerList from "../components/PlayerList";

export default function Lobby() {
  const navigate = useNavigate();
  const { room, players, leaveLobby, setPlayers, setQuestion } = useGame();
  const { user } = useUser();

  const [isReady, setIsReady] = useState(false);

  const gameStartedRef = useRef(false);

  useEffect(() => {
    // Block browser back button
    const blockBackButton = (e) => {
      e.preventDefault();
      e.returnValue = "Are you sure you want to leave?";

      if (window.confirm("Please use the 'Leave' button to exit the lobby.")) {
        leaveLobby(room.roomId, user.username);
        navigate("/", { replace: true });
      }
    };

    // Block page refresh/close
    window.addEventListener("beforeunload", blockBackButton);

    // Block browser back/forward
    window.history.pushState(null, "", window.location.pathname);
    window.addEventListener("popstate", blockBackButton);

    return () => {
      window.removeEventListener("beforeunload", blockBackButton);
      window.removeEventListener("popstate", blockBackButton);
    };
  }, [room, user, leaveLobby, navigate]);

  /* ---------- Check if user has a room ---------- */
  useEffect(() => {
    if (!room) {
      navigate("/", { replace: true });
    }
  }, [room, navigate]);

  /* ---------- Socket listeners ---------- */
  useEffect(() => {
    const updatePlayers = ({ players }) => setPlayers(players);

    const handleGameStarted = ({ players, question }) => {
      if (gameStartedRef.current) return;
      gameStartedRef.current = true;
      setPlayers(players);
      setQuestion(question);
      navigate("/game");
    };

    socket.on("newPlayerJoined", updatePlayers);
    socket.on("player-ready", updatePlayers);
    socket.on("question-delivered", handleGameStarted);

    return () => {
      socket.off("newPlayerJoined", updatePlayers);
      socket.off("player-ready", updatePlayers);
      socket.off("question-delivered", handleGameStarted);
    };
  }, [room, navigate, setPlayers, setQuestion]);

  /* ---------- Actions ---------- */
  const toggleReady = () => {
    const newReadyState = !isReady;
    setIsReady(newReadyState);
    socket.emit("set-ready", {
      roomId: room.roomId,
      isReady: newReadyState,
    });
  };

  const handleLeave = () => {
    leaveLobby(room.roomId, user.username);
    navigate("/", { replace: true });
  };

  const handleStartGame = () => {
    socket.emit("start-game", {
      roomId: room.roomId,
      adminName: user.username,
    });
  };

  const copyRoomCode = () => {
    navigator.clipboard.writeText(room.roomId);
  };

  if (!room) return null;

  return (
    <div className="lobby-container bg-base-100 min-h-screen p-5 md:p-8 font-sans flex flex-col">
      <header className="lobby-header flex justify-between items-center pb-3 border-b border-base-300 mb-6">
        <h1 className="lobby-title text-2xl md:text-3xl font-bold text-primary">
          ⚡ Game Lobby
        </h1>
        <div className="room-info flex flex-col md:flex-row items-start md:items-center gap-3 md:gap-4 bg-base-200 p-4 rounded-box">
          <div className="room-name font-semibold text-base-content">
            {room.roomName}
          </div>
          <div className="room-stats flex items-center gap-3">
            <span
              className="room-code font-mono bg-base-300 px-3 py-2 rounded-btn text-base-content cursor-pointer hover:bg-base-300/80"
              onClick={copyRoomCode}
            >
              Code: <strong>{room.roomId}</strong>
            </span>
            <span className="player-count bg-base-300 px-3 py-2 rounded-btn font-bold text-base-content">
              {players.length} / {room.maxPlayers}
            </span>
          </div>
          <div className="room-status text-base-content/80 italic">
            {players.length < room.maxPlayers
              ? "Waiting for players..."
              : "All players joined!"}
          </div>
          <button
            className="leave-btn btn btn-error btn-sm md:btn-md text-error-content"
            onClick={handleLeave}
          >
            Leave Room
          </button>
        </div>
      </header>

      <div className="lobby-grid grid grid-cols-1 lg:grid-cols-3 gap-5 flex-1">
        {/* PlayerList component will be in first column */}
        <PlayerList
          players={players}
          isReady={isReady}
          toggleReady={toggleReady}
        />

        {/* Chat component will be in middle column */}
        <Chat roomId={room.roomId} user={user} page={"lobby"} />
      </div>
    </div>
  );
}
