import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../contexts/UserContext";
import { useGame } from "../contexts/GameContext";
import { roomList } from "../services/api";
import "../pages/styles/dashboard.css";
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
    <>
      <div className="room-list-header">
        <h2 className="section-title">Available Rooms</h2>
        <div className="refresh-btn" onClick={handleRefresh}>
          <svg
            className="w-6 h-6 text-gray-800 dark:text-white"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              d="M21 12a9 9 0 11-3.72-7.02"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            <path
              d="M21 3v6h-6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
        </div>
      </div>

      <div className="rooms-list">
        {rooms.map((room) => (
          <div key={room.roomId} className="room-card">
            <div className="room-info">
              <div>{room.roomName}</div>
              <div className="room-details">
                <span>
                  <i className="fas fa-hashtag"></i> {room.roomId}
                </span>
                <span>
                  <i className="fas fa-users"></i> {room.playerCount}/
                  {room.maxPlayers}
                </span>
                <span>
                  <i className="fas fa-signal"></i> {room.difficulty}
                </span>
              </div>
            </div>

            <button
              className="room-join"
              disabled={room.playerCount >= room.maxPlayers}
              onClick={() => reqJoinRoom(room.roomId)}
            >
              {room.playerCount >= room.maxPlayers ? "Full" : "Join"}
            </button>
          </div>
        ))}
      </div>
    </>
  );
}
