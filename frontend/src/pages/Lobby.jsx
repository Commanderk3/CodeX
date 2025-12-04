import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import socket from "../socket";
import "./styles/lobby.css";

export default function Lobby() {
  const location = useLocation();
  const navigate = useNavigate();
  /*
  roomId,
  roomName: String,
  difficulty: String,
  maxPlayers: String,
  players: [
      {
        playerName: String,
        avatar: String,
        rating: int,
        isAdmin: bool,
        isReady: bool,
      },
    ],
 */

  const { roomId, roomName, difficulty, maxPlayers, players, user } =
    location.state || {};

  const [currPlayers, setCurrPlayers] = useState(players || []);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [countdown, setCountdown] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const messagesEndRef = useRef(null);

  const roomConfig = {
    roomName,
    roomId,
    players,
    maxPlayers,
    difficulty,
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (currPlayers.length >= 2 && currPlayers.every((p) => p.isReady)) {
      setCountdown(5);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            console.log("✅ Starting game!");
            // navigate("/game", { state: { roomId } });
            return null;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [currPlayers]);

  useEffect(() => {
    // new player joined
    const updatePlayerState = ({ newPlayer, players }) => {
      //notify(`${newPlayer} has joined the room!`);
      console.log(`${newPlayer} has joined the room!`);
      setCurrPlayers(players);
    };

    const updatePlayerReady = ({ players }) => {
      setCurrPlayers(players);
    };

    const updateChatMessage = ({ sender, message }) => {
      const msg = {
        id: Date.now() + Math.random(),
        user: sender,
        text: message,
      };
      console.log(msg);
      setMessages((prev) => [...prev, msg]);
    };

    socket.on("broadcast-msg", updateChatMessage);
    socket.on("player-ready", updatePlayerReady);
    socket.on("newPlayerJoined", updatePlayerState);
    return () => {
      socket.off("broadcast-msg", updateChatMessage);
      socket.off("player-ready", updatePlayerReady);
      socket.off("newPlayerJoined", updatePlayerState);
    };
  }, []);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const msg = {
      id: Date.now() + Math.random(),
      user: "You",
      text: newMessage,
    };

    setMessages((prev) => [...prev, msg]);
    console.log(newMessage);
    socket.emit("send-msg", { roomId, msg: newMessage, player: user.username });
    setNewMessage("");
  };

  const toggleReady = () => {
    setIsReady((prev) => !prev);
    socket.emit("set-ready", {
      roomId,
      isReady: !isReady,
      player: user.username,
    });
  };

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomConfig.roomId);
    console.log("Room code copied!");
  };

  const leaveLobby = () => {
    if (window.confirm("Leave the lobby?")) {
      console.log("Leaving...");
      navigate("/");
    }
  };

  return (
    <div className="lobby-container">
      {/* HEADER */}
      <header className="lobby-header">
        <h1 className="lobby-title">⚡ Game Lobby</h1>

        <div className="room-info">
          <div className="room-name">{roomConfig.roomName}</div>

          <div className="room-stats">
            <span className="room-code" onClick={copyRoomCode}>
              Code: <strong>{roomConfig.roomId}</strong>
            </span>
            <span className="player-count">
              {currPlayers.length} / {roomConfig.maxPlayers}
            </span>
          </div>

          <div className="room-status">
            {currPlayers.length < roomConfig.maxPlayers
              ? "Waiting for players to join..."
              : "All players joined!"}
          </div>

          <button className="leave-btn" onClick={leaveLobby}>
            Leave
          </button>
        </div>
      </header>

      {/* MAIN GRID */}
      <div className="lobby-grid">
        {/* LEFT: PLAYERS */}
        <div className="card players-card">
          <div className="card-header">
            Players {countdown !== null && ` • Starting in ${countdown}s`}
          </div>

          <div className="card-content players-list">
            {currPlayers.map((p, index) => (
              <div
                key={index}
                className={`player-item ${p.isReady ? "ready" : ""}`}
              >
                <div className="player-avatar">
                  {p.avatar ? p.avatar : p.playerName}
                </div>
                <div className="player-info">
                  <div className="player-name">
                    {p.playerName} {p.isAdmin && "👑"}
                  </div>
                  <div
                    className={`player-status ${
                      p.isReady ? "status-ready" : "status-waiting"
                    }`}
                  >
                    {p.isReady ? "Ready" : "Waiting"}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            className={`ready-btn ${isReady ? "ready" : "not-ready"}`}
            onClick={toggleReady}
          >
            {isReady ? "✅ Ready" : "Ready Up"}
          </button>
        </div>

        {/* CENTER: CHAT */}
        <div className="card chat-card">
          <div className="card-header">Lobby Chat</div>

          <div className="messages-container">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`message ${msg.user === "You" ? "own-message" : ""}`}
              >
                <div className="message-user">{msg.user}</div>
                <div className="message-text">{msg.text}</div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={sendMessage} className="message-input-form">
            <div className="input-container">
              <input
                type="text"
                className="message-input"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
              />
              <button className="send-btn">Send</button>
            </div>
          </form>
        </div>

        {/* RIGHT: QUICK ACTIONS */}
        <div className="card actions-card">
          <div className="card-header">Quick Actions</div>
          <div className="card-content quick-actions">
            <button className="action-btn">Invite</button>
            <button className="action-btn">Settings</button>
            <button className="action-btn">Start Game</button>
          </div>
        </div>
      </div>
    </div>
  );
}
