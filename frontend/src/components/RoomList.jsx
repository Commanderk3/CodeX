import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../contexts/UserContext";
import { roomList } from "../services/api";
import "../pages/styles/dashboard.css";
import socket from "../socket";

export default function RoomList() {
  const { user, loading } = useUser();
  const [rooms, setRooms] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await roomList(token);
        setRooms(res.data);
      } catch (err) {
        console.log("Error on loading room list", err);
      }
    };
    fetchRooms();
  }, []);

  const reqJoinRoom = ({ roomId }) => {
    if (!socket.connected) {
      socket.connect();
    }
    socket.emit("join-room", {
      roomId: roomId,
      playerName: user.username,
      avatar: user.avatar,
      rating: user.rating,
    });
  };

  useEffect(() => {
    // player joining a room
    const joinRoom = (roomDetails) => {
      console.log("i was able to join the room");
      navigate("/lobby", { state: { ...roomDetails, user } });
    };
    socket.on("roomJoinSuccess", joinRoom);
    return () => {
      socket.off("roomJoinSuccess", joinRoom);
    };
  }, [navigate]);

  return (
    <div className="rooms-list">
      {rooms.map((room) => (
        <div key={room.roomId} className="room-card">
          <div className="room-info">
            <div>{room.roomName}</div>
            <div className="room-details">
              <span>
                <i className="fas fa-signal"></i> {room.roomId}
              </span>
              <span>
                <i className="fas fa-users"></i> {room.players.length}/
                {room.maxPlayers}
              </span>
              <span>
                <i className="fas fa-signal"></i> {room.difficulty}
              </span>
            </div>
          </div>
          <button
            className="room-join"
            disabled={room.players >= room.maxPlayers}
            onClick={() => reqJoinRoom({ roomId: room.roomId })}
          >
            {room.players >= room.maxPlayers ? "Full" : "Join"}
          </button>
        </div>
      ))}
    </div>
  );
}
