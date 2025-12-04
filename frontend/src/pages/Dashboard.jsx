import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../contexts/UserContext";
import Navbar from "../components/Navbar";
import CreateRoom from "../components/CreateRoom/CreateRoom";
import "./styles/dashboard.css";
import socket from "../socket";
import RoomList from "../components/RoomList";

export default function Dashboard() {
  const { user, loading } = useUser();
  const [room, setRoom] = useState(null);
  const [winRate, setWinRate] = useState(0);
  const [isFindingMatch, setIsFindingMatch] = useState(false);
  const [showCreateRoom, setShowCreateRoom] = useState(false);

  const navigate = useNavigate();

  const calculateWinRate = (matches) => {
    if (!matches || matches.length === 0) return 0;
    const wins = matches.filter((match) => match.result === "victory").length;
    return Math.round((wins / matches.length) * 100);
  };

  useEffect(() => {
    if (!user) return;

    setWinRate(calculateWinRate(user.matchHistory));

    const handleMatch = ({
      roomId,
      players,
      question,
      createdAt,
      expiresAt,
    }) => {
      setRoom(roomId);
      setIsFindingMatch(false);
      navigate("./CodeArena", {
        state: {
          username: user.username,
          avatar: user.avatar,
          currRating: user.rating,
          language: user.language,
          roomId,
          players,
          question,
          createdAt,
          expiresAt,
        },
      });
    };

    socket.on("matchFound", handleMatch);

    return () => {
      socket.off("matchFound", handleMatch);
    };
  }, [user, navigate]);

  // Find Match
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

  // Room Creation
  const createRoom = () => {
    setShowCreateRoom(!showCreateRoom);
  };

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

  if (!user) {
    navigate("/signup");
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
      {showCreateRoom && (
        <CreateRoom
          showCreateRoom={showCreateRoom}
          setShowCreateRoom={setShowCreateRoom}
        />
      )}
      <Navbar />
      <div className="dashboard-container">
        <div className="dashboard-content">
          {/* User Profile Section */}
          <section className="section user-profile">
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
                <div className="detail-value">{user.rating}</div>
              </div>
              <div className="detail-card">
                <div className="detail-label">Matches Played</div>
                <div className="detail-value">{user.matchHistory.length}</div>
              </div>
              <div className="detail-card">
                <div className="detail-label">Win Rate</div>
                <div className="detail-value">{winRate}%</div>
              </div>
            </div>

            {/* Past Matches Section */}
            <div className="past-matches">
              <h3 className="past-matches-title">Past Matches</h3>
              {user.matchHistory.length === 0 ? (
                <p>No matches found</p>
              ) : (
                <ul className="matches-list two-columns">
                  {user.matchHistory.slice(0, 2).map((match, index) => (
                    <li
                      key={index}
                      className={`match-item ${match.result.toLowerCase()}`}
                    >
                      <span className="match-opponent">
                        {match.opponents.map((op) => op.playerName).join(", ")}
                      </span>
                      <span className="match-result">
                        {match.result.toUpperCase()}
                      </span>
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

            <RoomList />
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
