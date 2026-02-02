import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useGame } from "../contexts/GameContext";
import { useUser } from "../contexts/UserContext";
import Chat from "../components/ChatWindow/Chat";
import socket from "../socket";
import "./styles/lobby.css";
import PlayerList from "../components/PlayerList";

export default function Lobby() {
  const navigate = useNavigate();
  const { room, players, leaveLobby, setPlayers, setQuestion } = useGame();
  const { user } = useUser();

  const [isReady, setIsReady] = useState(false);

  const gameStartedRef = useRef(false);

  /* ---------- Prevent browser back button ---------- */
  useEffect(() => {
    // Block browser back button
    const blockBackButton = (e) => {
      // Show confirmation
      e.preventDefault();
      e.returnValue = "Are you sure you want to leave?";

      if (window.confirm("Please use the 'Leave' button to exit the lobby.")) {
        socket.emit("leave-room", {
          roomId: room.roomId,
          playerName: user.username
        });
        leaveLobby();
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
      player: user.username,
    });
  };

  const handleLeave = () => {
    socket.emit("leave-room", {
      roomId: room.roomId,
      playerName: user.username
    });
    leaveLobby();
    navigate("/", { replace: true });
  };

  const handleStartGame = () => {
    socket.emit("start-game", {
      roomId: room.roomId,
      adminName: user.username
    })
  }

  const copyRoomCode = () => {
    navigator.clipboard.writeText(room.roomId);
  };

  if (!room) return null;

  return (
    <div className="lobby-container">
      <header className="lobby-header">
        <h1 className="lobby-title">⚡ Game Lobby</h1>
        <div className="room-info">
          <div className="room-name">{room.roomName}</div>
          <div className="room-stats">
            <span className="room-code" onClick={copyRoomCode}>
              Code: <strong>{room.roomId}</strong>
            </span>
            <span className="player-count">
              {players.length} / {room.maxPlayers}
            </span>
          </div>
          <div className="room-status">
            {players.length < room.maxPlayers
              ? "Waiting for players..."
              : "All players joined!"}
          </div>
          <button className="leave-btn" onClick={handleLeave}>
            Leave Room
          </button>
        </div>
      </header>

      <div className="lobby-grid">
        <PlayerList
          players={players}
          isReady={isReady}
          toggleReady={toggleReady}
        />
        <Chat roomId={room.roomId} user={user} />

        {/* QUICK ACTIONS */}
        <div className="card actions-card">
          <div className="card-header">Quick Actions</div>
          <div className="card-content quick-actions">
            <button className="action-btn">Invite</button>
            <button className="action-btn">Settings</button>
            <button className="action-btn" onClick={handleStartGame}>Start Game</button>
          </div>
        </div>
      </div>
    </div>
  );
}