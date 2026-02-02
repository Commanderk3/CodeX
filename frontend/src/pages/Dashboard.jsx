import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../contexts/UserContext";
import { useGame } from "../contexts/GameContext";

import Navbar from "../components/Navbar";
import CreateRoom from "../components/CreateRoom/CreateRoom";
import RoomList from "../components/RoomList";
import "./styles/dashboard.css";
import TestButton from "../components/TestButton";
import socket from "../socket";

export default function Dashboard() {
  const { user, loading } = useUser();
  const { isFindingMatch, setIsFindingMatch } = useGame();
  const [winRate, setWinRate] = useState(0);
  const [showCreateRoom, setShowCreateRoom] = useState(false);

  const navigate = useNavigate();

  const calculateWinRate = (matches) => {
    if (!matches || matches.length === 0) return 0;
    const wins = matches.filter(m => m.result === "victory").length;
    return Math.round((wins / matches.length) * 100);
  };

  /* ------------------ socket: match found ------------------ */
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
      setIsFindingMatch(false);

      navigate("/codearena", {
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
    return () => socket.off("matchFound", handleMatch);
  }, [user, navigate, setIsFindingMatch]);

  /* ------------------ Find Match ------------------ */
  const findMatch = () => {
    if (!user) return;

    if (isFindingMatch) {
      setIsFindingMatch(false);
      socket.emit("cancel-match", { playerName: user.username });
      return;
    }

    setIsFindingMatch(true);

    if (!socket.connected) socket.connect();

    socket.emit("find-match", {
      playerName: user.username,
      avatar: user.avatar,
      rating: user.rating,
    });
  };

  /* ------------------ Create Room ------------------ */
  const toggleCreateRoom = () => {
    setShowCreateRoom(prev => !prev);
  };

  /* ------------------ Guards ------------------ */
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
    return null;
  }

  /* ------------------ Render ------------------ */
  return (
    <>
      {showCreateRoom && (
        <CreateRoom
          showCreateRoom={showCreateRoom}
          setShowCreateRoom={setShowCreateRoom}
          /* CreateRoom will navigate to /lobby itself */
        />
      )}

      <Navbar />

      <div className="dashboard-container">
        <div className="dashboard-content">

          {/* User Profile */}
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
          </section>

          {/* Rooms */}
          <section className="section available-rooms">
            <RoomList />
          </section>

          {/* Actions */}
          <section className="section action-buttons">
            <button className="action-btn find-match" onClick={findMatch}>
              {isFindingMatch ? "Cancel" : "Find Match"}
            </button>

            <button className="action-btn create-room" onClick={toggleCreateRoom}>
              Create a Room
            </button>
          </section>

          {/* Match Loader */}
          {isFindingMatch && (
            <section className="section matching-indicator active">
              <div className="loader"></div>
              <p>Finding a match for you...</p>
            </section>
          )}

        </div>
      </div>
    </>
  );
}
