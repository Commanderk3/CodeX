import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../contexts/UserContext";
import { useGame } from "../contexts/GameContext";
import { useSystemMessages } from "../contexts/SystemMessageContext";
import { roomList } from "../services/api";
import socket from "../socket";

export default function RoomList() {
  const { user } = useUser();
  const { setRoom, setPlayers } = useGame();
  const [rooms, setRooms] = useState([]);
  const navigate = useNavigate();

  // Fetch all rooms from API
  const fetchRooms = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await roomList(token);
      setRooms(res.data);
    } catch (err) {
      console.log("Error on loading room list", err);
    }
  };

  // Refresh button
  const handleRefresh = () => fetchRooms();

  // Request to join room
  const reqJoinRoom = (roomId) => {
    if (!socket.connected) socket.connect();
    socket.emit("join-room", {
      roomId,
      playerName: user.username,
      avatar: user.avatar,
      rating: user.rating,
    });
  };

  // Socket listener for successful join
  useEffect(() => {
    const joinRoom = (roomDetails) => {
      console.log("Joined room successfully:", roomDetails);

      // Save room and players in context
      setRoom({
        roomId: roomDetails.roomId,
        roomName: roomDetails.roomName,
        difficulty: roomDetails.difficulty,
        maxPlayers: roomDetails.maxPlayers,
      });

      setPlayers(roomDetails.players);

      // Navigate to Lobby (no location.state)
      navigate("/lobby", { replace: true });
    };

    socket.on("roomJoinSuccess", joinRoom);

    return () => {
      socket.off("roomJoinSuccess", joinRoom);
    };
  }, [navigate, setRoom, setPlayers]);

  useEffect(() => {
    fetchRooms();
  }, []);

  return (
    <div className="space-y-4">
      {/* Header - Improved contrast */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-base-content">Available Rooms</h2>

        <button
          className="btn btn-ghost btn-circle hover:bg-base-200"
          onClick={handleRefresh}
          title="Refresh"
        >
          <svg
            className="w-5 h-5 text-base-content"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              d="M21 12a9 9 0 11-3.72-7.02"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M21 3v6h-6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      {/* List */}
      <div className="overflow-y-auto max-h-100 pr-2">
        <div className="space-y-3">
          {rooms.length === 0 && (
            <div className="alert alert-info bg-info/10 border-info/20">
              <span className="text-base-content">
                No rooms available right now
              </span>
            </div>
          )}

          {rooms.map((room) => (
            <div
              key={room.roomId}
              className="card bg-base-200 shadow-sm border border-base-300"
            >
              <div className="card-body py-4">
                <div className="flex items-center justify-between gap-4">
                  {/* Room info - Improved contrast */}
                  <div className="space-y-1">
                    <h3 className="font-semibold text-base-content">
                      {room.roomName}
                    </h3>

                    <div className="flex gap-2 text-sm">
                      <span className="badge badge-outline border-base-300 text-base-content/80">
                        #{room.roomId}
                      </span>
                      <span className="badge bg-info/10 border-info/20 text-base-content">
                        👥 {room.playerCount}/{room.maxPlayers}
                      </span>
                      <span className="badge bg-warning/10 border-warning/20 text-base-content">
                        ⚡ {room.difficulty}
                      </span>
                    </div>
                  </div>

                  {/* Action */}
                  <button
                    className={`btn btn-sm ${
                      room.playerCount >= room.maxPlayers
                        ? "btn-disabled bg-base-200 text-base-content/50"
                        : "btn-primary"
                    }`}
                    disabled={room.playerCount >= room.maxPlayers}
                    onClick={() => reqJoinRoom(room.roomId)}
                  >
                    {room.playerCount >= room.maxPlayers ? "Full" : "Join"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
