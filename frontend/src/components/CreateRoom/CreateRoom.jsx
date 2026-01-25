import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import socket from "../../socket";
import { useUser } from "../../contexts/UserContext";
import { useGame } from "../../contexts/GameContext";
import "./CreateRoom.css";

export default function CreateRoom({ showCreateRoom, setShowCreateRoom }) {
  const { user } = useUser();
  const { setRoom, setPlayers } = useGame();

  const [roomName, setRoomName] = useState("");
  const [difficulty, setDifficulty] = useState("Easy");
  const [maxPlayers, setMaxPlayers] = useState(3);
  const [isPrivate, setIsPrivate] = useState(false);
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    const roomConfig = {
      roomName,
      maxPlayers,
      difficulty,
      isPrivate,
      password,
    };

    if (!socket.connected) socket.connect();

    socket.emit("create-room", {
      admin: user.username,
      avatar: user.avatar,
      rating: user.rating,
      roomConfig,
    });
  };

  useEffect(() => {
    const handleRoomCreated = (roomDetails) => {
      /**
       * Expected roomDetails shape:
       * {
       *   roomId,
       *   roomName,
       *   difficulty,
       *   maxPlayers,
       *   players: [...]
       * }
       */

      setRoom({
        roomId: roomDetails.roomId,
        roomName: roomDetails.roomName,
        difficulty: roomDetails.difficulty,
        maxPlayers: roomDetails.maxPlayers,
      });

      setPlayers(roomDetails.players);

      navigate("/lobby", { replace: true });
    };

    socket.on("roomCreated", handleRoomCreated);

    return () => {
      socket.off("roomCreated", handleRoomCreated);
    };
  }, [navigate, setRoom, setPlayers]);

  return (
    <div className="dialog-overlay">
      <div className="create-room-dialog">
        <div className="dialog-header">
          <h2 className="dialog-title">Create New Room</h2>
        </div>

        <form className="room-form" onSubmit={handleSubmit}>
          {/* Room Name */}
          <div className="form-group">
            <label className="form-label">Room Name</label>
            <input
              className="form-input"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              required
            />
          </div>

          {/* Max Players */}
          <div className="form-group">
            <label className="form-label">Max Players</label>
            <select
              className="form-select"
              value={maxPlayers}
              onChange={(e) => setMaxPlayers(Number(e.target.value))}
            >
              {[3, 4, 5, 6].map(n => (
                <option key={n} value={n}>{n} Players</option>
              ))}
            </select>
          </div>

          {/* Difficulty */}
          <div className="form-group">
            <label className="form-label">Difficulty</label>
            <select
              className="form-select"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
            >
              <option>Easy</option>
              <option>Medium</option>
              <option>Hard</option>
            </select>
          </div>

          {/* Privacy */}
          <div className="form-group">
            <label className="form-label">Room Privacy</label>
            <div className="privacy-options">
              <label>
                <input
                  type="radio"
                  checked={!isPrivate}
                  onChange={() => setIsPrivate(false)}
                />
                Public
              </label>
              <label>
                <input
                  type="radio"
                  checked={isPrivate}
                  onChange={() => setIsPrivate(true)}
                />
                Private
              </label>
            </div>
          </div>

          {isPrivate && (
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          )}

          <div className="dialog-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setShowCreateRoom(false)}
            >
              Cancel
            </button>

            <button type="submit" className="btn btn-primary">
              Create Room
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
