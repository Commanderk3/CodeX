import React, { useState, useEffect } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:5000");

export default function Chat() {
  const [room, setRoom] = useState("");
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);

  useEffect(() => {
    // Listen for chat messages
    socket.on("chat", (data) => {
      setChat((prev) => [...prev, data]);
    });

    return () => socket.off("chat");
  }, []);

  const joinRoom = () => {
    if (room.trim()) {
      socket.emit("join_room", room);
    }
  };

  const sendMessage = () => {
    if (message.trim() && room.trim()) {
      socket.emit("chat", { roomName: room, message });
      setMessage("");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Chat App with Rooms</h2>

      <div>
        <input
          type="text"
          placeholder="Room name"
          value={room}
          onChange={(e) => setRoom(e.target.value)}
        />
        <button onClick={joinRoom}>Join Room</button>
      </div>

      <div style={{ marginTop: "10px" }}>
        <input
          type="text"
          placeholder="Message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button onClick={sendMessage}>Send</button>
      </div>

      <div style={{ marginTop: "20px" }}>
        <h3>Messages</h3>
        {chat.map((c, i) => (
          <p key={i}>
            <strong>{c.sender}:</strong> {c.message}
          </p>
        ))}
      </div>
    </div>
  );
}
