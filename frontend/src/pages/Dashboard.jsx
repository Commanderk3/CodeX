import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../contexts/UserContext";
import Navbar from "../components/Navbar";
import "./dashboard.css";
import socket from "../socket";

export default function Dashboard() {
  const { user, loading } = useUser();
  const [room, setRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isFindingMatch, setIsFindingMatch] = useState(false);

  const [rooms, setRooms] = useState([
    {
      id: 1,
      name: "JavaScript Challengers",
      players: 3,
      maxPlayers: 4,
      language: "JavaScript",
      level: "Intermediate",
    },
    {
      id: 2,
      name: "Python Pros",
      players: 2,
      maxPlayers: 2,
      language: "Python",
      level: "Advanced",
    },
    {
      id: 3,
      name: "Java Beginners",
      players: 1,
      maxPlayers: 3,
      language: "Java",
      level: "Beginner",
    },
    {
      id: 4,
      name: "C++ Masters",
      players: 4,
      maxPlayers: 4,
      language: "C++",
      level: "Advanced",
    },
  ]);

  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    const handleMatch = ({ roomId, players, question }) => {
      setRoom(roomId);
      setIsFindingMatch(false);
      console.log("Received match from server:", {
        username: user.username,
        avatar: user.avatar,
        rating: user.rating,
        roomId,
        players,
        question,
      });
      navigate("./CodeArena", {
        state: {
          username: user.username,
          avatar: user.avatar,
          currRating: user.rating,
          roomId,
          players,
          question,
        },
      });
    };

    const handleMessage = (msg) => {
      setMessages((prev) => [...prev, msg]);
    };

    socket.on("matchFound", handleMatch);
    socket.on("message", handleMessage);

    return () => {
      socket.off("matchFound", handleMatch);
      socket.off("message", handleMessage);
    };
  }, [user, navigate]);

  const findMatch = () => {
    if (isFindingMatch) {
      setIsFindingMatch(false);
      if (socket.connected) {
        socket.emit("cancel-match", {
          playerName: user.username,
        });
      }
      return;
    }

    if (!user) {
      console.log("User not loaded yet");
      return;
    }

    setIsFindingMatch(true);
    if (!socket.connected) {
      socket.connect();
    }
    socket.emit("find-match", {
      playerName: user.username,
      avatar: user.avatar,
      rating: user.rating,
    });
  };

  const createRoom = () => {
    alert("Create room functionality would go here");
  };

  const joinRoom = (roomId) => {
    alert(`Joining room with ID: ${roomId}`);
  };

  // Show loading state
  if (loading) {
    return (
      <>
        <Navbar />
        <div className="dashboard-container">
          <div className="loading-state">Loading...</div>
        </div>
      </>
    );
  }

  // Show login prompt if no user
  if (!user) {
    return (
      <>
        <Navbar />
        <div className="dashboard-container">
          <div className="login-prompt">
            <p>Please log in to access the dashboard</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="dashboard-container">
        <div className="dashboard-content">
          {/* User Profile Section */}
          <section className="section user-profile">
            <h2 className="section-title">User Profile</h2>

            <div className="profile-header">
              <div className="avatar">{user.avatar}</div>
              <div className="user-info">
                <div className="user-name">{user.username}</div>
              </div>
            </div>

            <div className="profile-details">
              <div className="detail-card">
                <div className="detail-label">Preferred Language</div>
                <div className="detail-value">{user.language}</div>
              </div>
              <div className="detail-card">
                <div className="detail-label">Skill Level</div>
                <div className="detail-value">{user.skillLevel}</div>
              </div>
              <div className="detail-card">
                <div className="detail-label">Matches Played</div>
                <div className="detail-value">{user.matchesPlayed}</div>
              </div>
              <div className="detail-card">
                <div className="detail-label">Win Rate</div>
                <div className="detail-value">{user.winRate}%</div>
              </div>
            </div>

            {/* Past Matches Section */}
            <div className="past-matches">
              <h3 className="past-matches-title">Past Matches</h3>
              {user.matchHistory.length === 0 ? (
                <p>No matches found</p>
              ) : (
                <ul className="matches-list two-columns">
                  {user.matchHistory.slice(0, 5).map((match, index) => (
                    <li
                      key={index}
                      className={`match-item ${match.result.toLowerCase()}`}
                    >
                      <span className="match-opponent">{match.opponent}</span>
                      <span className="match-result">{match.result}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>

          {/* Available Rooms Section */}
          <section className="section available-rooms">
            <h2 className="section-title">
              <i className="fas fa-door-open"></i> Available Rooms
            </h2>

            <div className="rooms-list">
              {rooms.map((room) => (
                <div key={room.id} className="room-card">
                  <div className="room-info">
                    <div className="room-name">{room.name}</div>
                    <div className="room-details">
                      <span>
                        <i className="fas fa-users"></i> {room.players}/
                        {room.maxPlayers}
                      </span>
                      <span>
                        <i className="fas fa-code"></i> {room.language}
                      </span>
                      <span>
                        <i className="fas fa-signal"></i> {room.level}
                      </span>
                    </div>
                  </div>
                  <button
                    className="room-join"
                    onClick={() => joinRoom(room.id)}
                    disabled={room.players >= room.maxPlayers}
                  >
                    {room.players >= room.maxPlayers ? "Full" : "Join"}
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Action Buttons Section */}
          <section className="section action-buttons">
            <button className="action-btn find-match" onClick={findMatch}>
              {isFindingMatch ? "Cancel" : "Find Match"}
            </button>

            <button className="action-btn create-room" onClick={createRoom}>
              Create a Room
            </button>
          </section>

          {/* Matching Indicator */}
          {isFindingMatch && (
            <section className="section matching-indicator active">
              <div className="loader"></div>
              <p>Finding a match for you...</p>
            </section>
          )}

          {/* Display room info when matched */}
          {room && (
            <div className="matched-room">
              <h3>Matched in room: {room}</h3>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
