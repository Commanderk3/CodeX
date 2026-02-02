import socket from "../socket";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useFindMatch } from "../hooks/findMatch";
import { useLocation } from "react-router-dom";
import { useGame } from "../contexts/GameContext";
import { useUser } from "../contexts/UserContext";
import Navbar from "../components/Navbar";

export default function MatchResult() {
  const location = useLocation();
  const { isFindingMatch, setIsFindingMatch } = useGame();

  const [isVictory, setIsVictory] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [opponentStats, setOpponentStats] = useState(null);
  const [rankChange, setRankChange] = useState(null);

  const { user, loading } = useUser();

  const { findMatch } = useFindMatch({
    user,
    isFindingMatch,
    setIsFindingMatch,
  });

  const navigate = useNavigate();

  const {
    username,
    opponent,
    oppAvatar,
    currRating,
    mappedResult,
    totalTestCases,
    createdAt,
  } = location.state || {};

  const getAvatarSrc = (name) =>
    new URL(`../assets/avatars/${name}.png`, import.meta.url).href;

  useEffect(() => {
    if (!location.state) {
      console.error("No state data provided");
      return;
    }

    let outcome;
    if (mappedResult[username].draw === true) {
      outcome = "draw";
    } else if (mappedResult[username].won === true) {
      outcome = "victory";
    } else {
      outcome = "defeat";
    }
    setIsVictory(outcome);

    const userTime = mappedResult[username].timeTaken;
    const userPassed = mappedResult[username].testCasePassed;

    setUserStats({
      time: userTime,
      testCases: `${userPassed}/${totalTestCases}`,
      efficiency: calculateEfficiency(userPassed, totalTestCases, userTime),
    });

    const opponentTime = mappedResult[opponent].timeTaken;
    const opponentPassed = mappedResult[opponent].testCasePassed;

    setOpponentStats({
      name: opponent,
      time: opponentTime,
      testCases: `${opponentPassed}/${totalTestCases}`,
      efficiency: calculateEfficiency(
        opponentPassed,
        totalTestCases,
        opponentTime,
      ),
    });

    setRankChange({
      current: currRating,
      new: mappedResult[username].rating,
      value: mappedResult[username].rating - currRating,
    });
  }, [
    location.state,
    username,
    opponent,
    oppAvatar,
    currRating,
    mappedResult,
    totalTestCases,
    createdAt,
  ]);

  useEffect(() => {
    if (!user) return;

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

  const calculateEfficiency = (passed, total, time) => {
    const accuracy = (passed / total) * 100;
    const timeScore = Math.max(0, 100 - time);
    return Math.round((accuracy + timeScore) / 2);
  };

  // Navigation handlers
  const handleFindMatch = () => {
    console.log("*");
    findMatch();
  };

  const handleReMatch = () => {
    //
  };

  // Show loading state while processing data
  if (isVictory === null || !userStats || !opponentStats || !rankChange) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <span className="loading loading-spinner loading-lg text-primary"></span>
            <p className="mt-4">Loading results...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="max-h-screen bg-base-100 p-4">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Header */}
          <div
            className={`card ${isVictory === "victory" ? "bg-green-50 border-green-200" : isVictory === "defeat" ? "bg-red-50 border-red-200" : "bg-gray-50 border-gray-200"} border`}
          >
            <div className="card-body p-6 text-center">
              <h1
                className={`text-2xl font-bold ${isVictory === "victory" ? "text-green-600" : isVictory === "defeat" ? "text-red-600" : "text-gray-600"}`}
              >
                {isVictory === "victory"
                  ? "VICTORY"
                  : isVictory === "defeat"
                    ? "DEFEAT"
                    : "DRAW"}
              </h1>
              <p className="text-sm text-gray-500">
                {createdAt ? new Date(createdAt).toLocaleDateString() : "Today"}
              </p>
            </div>
          </div>

          {/* Players */}
          <div className="card bg-base-100 border">
            <div className="card-body p-4">
              <div className="flex items-center justify-between">
                <div className="text-center">
                  <div className="avatar placeholder">
                    <img
                      src={getAvatarSrc(user.avatar)}
                      alt={user.avatar}
                      className="w-14 h-14 rounded-full object-contain"
                    />
                  </div>
                  <div className="mt-2 font-medium">{username}</div>
                  <div className="text-sm text-gray-500">{userStats.time}m</div>
                </div>

                <div className="text-center">
                  <div className="badge badge-outline p-2">VS</div>
                </div>

                <div className="text-center">
                  <div className="avatar placeholder">
                    <img
                      src={getAvatarSrc(oppAvatar || "woman")}
                      alt={oppAvatar}
                      className="w-14 h-14 rounded-full object-contain"
                    />
                  </div>
                  <div className="mt-2 font-medium">{opponentStats.name}</div>
                  <div className="text-sm text-gray-500">
                    {opponentStats.time}m
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4">
            <div className="stat bg-base-100 border rounded-box p-4">
              <div className="stat-title text-sm">Time</div>
              <div className="stat-value text-lg">{userStats.time}m</div>
            </div>

            <div className="stat bg-base-100 border rounded-box p-4">
              <div className="stat-title text-sm">Test Cases</div>
              <div className="stat-value text-lg">{userStats.testCases}</div>
            </div>

            <div className="stat bg-base-100 border rounded-box p-4">
              <div className="stat-title text-sm">Efficiency</div>
              <div className="stat-value text-lg">{userStats.efficiency}</div>
            </div>

            <div className="stat bg-base-100 border rounded-box p-4">
              <div className="stat-title text-sm">Rating</div>
              <div
                className={`stat-value text-lg ${rankChange.value > 0 ? "text-green-600" : rankChange.value < 0 ? "text-red-600" : ""}`}
              >
                {rankChange.value > 0
                  ? `+${rankChange.value}`
                  : rankChange.value}
              </div>
            </div>
          </div>

          {/* Rating Progress */}
          <div className="card bg-base-100 border">
            <div className="card-body p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">Rating Change</span>
                <div
                  className={`badge ${rankChange.value > 0 ? "badge-success" : rankChange.value < 0 ? "badge-error" : "badge-neutral"}`}
                >
                  {rankChange.current} → {rankChange.new}
                </div>
              </div>
              <progress
                className={`progress w-full ${rankChange.value > 0 ? "progress-success" : rankChange.value < 0 ? "progress-error" : "progress-neutral"}`}
                value={rankChange.new}
                max="1000"
              ></progress>
            </div>
          </div>

          {/* Actions */}
          <div className="flex">
            <button
              onClick={handleFindMatch}
              className="btn btn-primary flex-1"
            >
              {isFindingMatch ? "Cancel" : "Find Match"}
            </button>
          </div>
          {isFindingMatch && (
            <div className="flex gap-10">
              <span className="loading loading-dots loading-md text-primary"></span>
              <p className="text-base-content mt-2">
                Finding a match for you...
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
