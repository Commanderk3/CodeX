import { useState, useEffect } from "react";
import { useFindMatch } from "../hooks/findMatch";
import { useNavigate } from "react-router-dom";
import { useUser } from "../contexts/UserContext";
import { useGame } from "../contexts/GameContext";

import Navbar from "../components/Navbar";
import CreateRoom from "../components/CreateRoom/CreateRoom";
import RoomList from "../components/RoomList";
import "./styles/dashboard.css";
import socket from "../socket";
import Leaderboard from "../components/Leaderboard";

export default function Dashboard() {
  const { user, loading } = useUser();
  const { isFindingMatch, setIsFindingMatch } = useGame();
  const [winRate, setWinRate] = useState(0);
  const [showCreateRoom, setShowCreateRoom] = useState(false);

  const { findMatch } = useFindMatch({
    user,
    isFindingMatch,
    setIsFindingMatch,
  });

  const navigate = useNavigate();

  const calculateWinRate = (matches) => {
    if (!matches || matches.length === 0) return 0;
    const wins = matches.filter((m) => m.result === "victory").length;
    return Math.round((wins / matches.length) * 100);
  };

  /* ------------------ socket: match found ------------------ */
  useEffect(() => {
    if (!user) return;

    setWinRate(calculateWinRate(user.matchHistory));

    const handleMatch = ({ roomId, players, question, expiresAt }) => {
      setIsFindingMatch(false);

      navigate("/codearena", {
        state: {
          username: user.username,
          avatar: user.avatar,
          currRating: user.rating,
          lang: user.language,
          roomId,
          players,
          question,
          expiresAt,
        },
      });
    };

    socket.on("matchFound", handleMatch);
    return () => socket.off("matchFound", handleMatch);
  }, [user, navigate, setIsFindingMatch]);

  /* ------------------ Create Room ------------------ */
  const toggleCreateRoom = () => {
    setShowCreateRoom((prev) => !prev);
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
        />
      )}

      <Navbar />

      {/* Updated container with better light mode background */}
      <div className="dashboard-container bg-base-100">
        <div className="dashboard-content">
          {/* User Profile - Added border for better separation */}
          <section className="card bg-base-100 shadow-md border border-base-300">
            <div className="card-body gap-6">
              {/* Header */}
              <div className="flex items-center gap-4">
                <div className="avatar placeholder">
                  <div className="w-14 h-14 rounded-full bg-primary text-primary-content flex items-center justify-center text-2xl">
                    {user.avatar}
                  </div>
                </div>

                <h2 className="card-title text-xl text-base-content">
                  {user.username}
                </h2>
              </div>

              {/* Stats - Enhanced contrast for stat titles */}
              <div className="grid grid-cols-1 gap-4">
                <div className="stat bg-base-200 rounded-box p-3 border border-base-300">
                  <div className="stat-title text-base-content/70 font-medium">
                    Language
                  </div>
                  <div className="stat-value text-lg text-base-content">
                    {user.language}
                  </div>
                </div>

                <div className="stat bg-base-200 rounded-box p-3 border border-base-300">
                  <div className="stat-title text-base-content/70 font-medium">
                    Rating
                  </div>
                  <div className="stat-value text-lg text-base-content">
                    {user.rating}
                  </div>
                </div>

                <div className="stat bg-base-200 rounded-box p-3 border border-base-300">
                  <div className="stat-title text-base-content/70 font-medium">
                    Matches
                  </div>
                  <div className="stat-value text-lg text-base-content">
                    {user.matchHistory.length}
                  </div>
                </div>

                <div className="stat bg-base-200 rounded-box p-3 border border-base-300">
                  <div className="stat-title text-base-content/70 font-medium">
                    Win Rate
                  </div>
                  <div className="stat-value text-lg text-base-content">
                    {winRate}%
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Rooms - Added border and better text contrast */}
          <section className="section card bg-base-100 shadow-md p-5 border border-base-300">
            <RoomList />
          </section>

          <section className="section card bg-base-100 shadow-md p-5 border border-base-300">
            <Leaderboard />
          </section>
        </div>
        {/* Actions - No changes needed here */}
        <section className="flex gap-10 action-buttons m-5">
          <section className="flex gap-4">
            <button className="btn btn-primary" onClick={findMatch}>
              {isFindingMatch ? "Cancel" : "Find Match"}
            </button>

            <button className="btn btn-secondary" onClick={toggleCreateRoom}>
              Create a Room
            </button>
          </section>
          {/* Match Loader - Improved text contrast */}
          {isFindingMatch && (
            <section className="section flex-1">
              <span className="loading loading-dots loading-md text-primary"></span>
              <p className="text-base-content mt-2">
                Finding a match for you...
              </p>
            </section>
          )}
        </section>
      </div>
    </>
  );
}
