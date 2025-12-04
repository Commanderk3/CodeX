import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import socket from "../../socket";
import { useUser } from "../../contexts/UserContext";
import "./CreateRoom.css";

export default function CreateRoom({ showCreateRoom, setShowCreateRoom }) {
  const { user, loading } = useUser();
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
    console.log(roomConfig);
    try {
      if (!socket.connected) {
        socket.connect();
      }
      socket.emit("create-room", {
        admin: user.username,
        avatar: user.avatar,
        rating: user.rating,
        roomConfig,
      });
    } catch (e) {
      console.log("Error on creating room :", e);
    }
  };

  useEffect(() => {
    const roomCreated = (roomDetails) => {
      navigate("/lobby", {
        state: { ...roomDetails, user },
      });
    };
    socket.on("roomCreated", roomCreated);
  }, []);

  return (
    <div className="dialog-overlay">
      <div className="create-room-dialog">
        {/* Header */}
        <div className="dialog-header">
          <h2 className="dialog-title">Create New Room</h2>
        </div>

        {/* Form */}
        <form className="room-form" onSubmit={handleSubmit}>
          {/* Room Name */}
          <div className="form-group">
            <label htmlFor="roomName" className="form-label">
              Room Name
            </label>
            <input
              type="text"
              id="roomName"
              className="form-input"
              placeholder="Enter room name"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              required
            />
          </div>

          {/* Max Players */}
          <div className="form-group">
            <label htmlFor="maxPlayers" className="form-label">
              Max Players
            </label>
            <select
              id="maxPlayers"
              className="form-select"
              value={maxPlayers}
              onChange={(e) => setMaxPlayers(Number(e.target.value))}
            >
              <option value={3}>3 Players</option>
              <option value={4}>4 Players</option>
              <option value={5}>5 Players</option>
              <option value={6}>6 Players</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="setDifficulty" className="form-label">
              Difficulty
            </label>
            <select
              id="setDifficulty"
              className="form-select"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
            >
              <option value={"Easy"}> Easy</option>
              <option value={"Medium"}> Medium</option>
              <option value={"Hard"}> Hard</option>
            </select>
          </div>

          {/* Privacy Settings */}
          <div className="form-group">
            <label className="form-label">Room Privacy</label>
            <div className="privacy-options">
              <label className="privacy-option">
                <input
                  type="radio"
                  name="privacy"
                  checked={!isPrivate}
                  onChange={() => setIsPrivate(false)}
                />
                <span className="privacy-label">
                  <i className="fas fa-globe"></i>
                  Public
                </span>
              </label>
              <label className="privacy-option">
                <input
                  type="radio"
                  name="privacy"
                  checked={isPrivate}
                  onChange={() => setIsPrivate(true)}
                />
                <span className="privacy-label">
                  <i className="fas fa-lock"></i>
                  Private
                </span>
              </label>
            </div>
          </div>

          {/* Password (only show if private) */}
          {isPrivate && (
            <div className="form-group">
              <label htmlFor="room-password" className="form-label">
                Room Password
              </label>
              <input
                type="text"
                id="password"
                className="form-input"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required={isPrivate}
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="dialog-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setShowCreateRoom(!showCreateRoom);
              }}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <i className="fas fa-plus"></i>
              Create Room
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
