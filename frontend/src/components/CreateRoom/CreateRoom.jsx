import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import socket from "../../socket";
import { useUser } from "../../contexts/UserContext";
import { useGame } from "../../contexts/GameContext";
import { useSystemMessages } from "../../contexts/SystemMessageContext";


export default function CreateRoom({ showCreateRoom, setShowCreateRoom }) {
  const { user } = useUser();
  const { setRoom, setPlayers } = useGame();
  const { addMessage } = useSystemMessages();

  const [roomName, setRoomName] = useState("");
  const [difficulty, setDifficulty] = useState("Easy");
  const [maxPlayers, setMaxPlayers] = useState(3);
  const [isPrivate, setIsPrivate] = useState(false);
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const roomConfig = {
      roomName,
      maxPlayers,
      difficulty,
      isPrivate,
      password,
    };

    if (!socket.connected) socket.connect();

    await new Promise((resolve) => setTimeout(resolve, 500));

    if (!socket.connected) {
      addMessage("error", "Whoops! Could not connect to server.");
      addMessage("warning", "Make sure you use only one tab.");
      throw new Error("Could not connect to server");
    }

    socket.emit("create-room", {
      admin: user.username,
      avatar: user.avatar,
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
    <div className="dialog-overlay modal modal-open modal-middle">
      <div className="create-room-dialog modal-box max-w-md bg-base-100 border border-base-300 shadow-xl">
        <div className="dialog-header flex justify-between items-center pb-4 border-b border-base-300 mb-6">
          <h2 className="dialog-title text-xl font-semibold text-primary flex items-center gap-2">
            <span>➕</span> Create New Room
          </h2>
        </div>

        <form className="room-form" onSubmit={handleSubmit}>
          {/* Room Name */}
          <div className="form-group mb-6">
            <label className="form-label label">
              <span className="label-text text-base-content font-medium">
                Room Name
              </span>
            </label>
            <input
              className="form-input input input-bordered w-full bg-base-100 text-base-content"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              required
            />
          </div>

          {/* Max Players */}
          <div className="form-group mb-6">
            <label className="form-label label">
              <span className="label-text text-base-content font-medium">
                Max Players
              </span>
            </label>
            <select
              className="form-select select select-bordered w-full bg-base-100 text-base-content"
              value={maxPlayers}
              onChange={(e) => setMaxPlayers(Number(e.target.value))}
            >
              {[3, 4, 5, 6].map((n) => (
                <option key={n} value={n}>
                  {n} Players
                </option>
              ))}
            </select>
          </div>

          {/* Difficulty */}
          <div className="form-group mb-6">
            <label className="form-label label">
              <span className="label-text text-base-content font-medium">
                Difficulty
              </span>
            </label>
            <select
              className="form-select select select-bordered w-full bg-base-100 text-base-content"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
            >
              <option>Easy</option>
              <option>Medium</option>
              <option>Hard</option>
            </select>
          </div>

          {/* Privacy */}
          <div className="form-group mb-6">
            <label className="form-label label">
              <span className="label-text text-base-content font-medium">
                Room Privacy
              </span>
            </label>
            <div className="privacy-options flex gap-4 mt-2">
              <label className="label cursor-pointer gap-2">
                <input
                  type="radio"
                  className="radio radio-primary"
                  checked={!isPrivate}
                  onChange={() => setIsPrivate(false)}
                />
                <span className="label-text text-base-content">Public</span>
              </label>
              <label className="label cursor-pointer gap-2">
                <input
                  type="radio"
                  className="radio radio-primary"
                  checked={isPrivate}
                  onChange={() => setIsPrivate(true)}
                />
                <span className="label-text text-base-content">Private</span>
              </label>
            </div>
          </div>

          {isPrivate && (
            <div className="form-group mb-6">
              <label className="form-label label">
                <span className="label-text text-base-content font-medium">
                  Password
                </span>
              </label>
              <input
                className="form-input input input-bordered w-full bg-base-100 text-base-content"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required={isPrivate}
              />
            </div>
          )}

          <div className="dialog-actions flex justify-end gap-3 pt-4 border-t border-base-300">
            <button
              type="button"
              className="btn btn-outline"
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
