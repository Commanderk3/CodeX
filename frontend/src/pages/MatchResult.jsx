import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import "./matchresults.css";

export default function MatchResult() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isVictory, setIsVictory] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [opponentStats, setOpponentStats] = useState(null);
  const [rankChange, setRankChange] = useState(null);

  // Extract data from location state
  const {
    username,
    opponent,
    currRating,
    mappedResult,
    totalTestCases,
    createdAt,
  } = location.state || {};

  useEffect(() => {
    if (!location.state) {
      console.error("No state data provided");
      return;
    }

    // Determine match outcome
    let outcome;
    if (mappedResult[username].draw === true) {
      outcome = "draw";
    } else if (mappedResult[username].won === true) {
      outcome = "victory";
    } else {
      outcome = "defeat";
    }
    setIsVictory(outcome);

    // Calculate user stats
    const userTime = mappedResult[username].timeTaken;
    const userPassed = mappedResult[username].testCasePassed;

    setUserStats({
      time: userTime,
      testCases: `${userPassed}/${totalTestCases}`,
      efficiency: calculateEfficiency(userPassed, totalTestCases, userTime),
    });

    // Calculate opponent stats
    const opponentTime = mappedResult[opponent].timeTaken;
    const opponentPassed = mappedResult[opponent].testCasePassed;

    setOpponentStats({
      name: opponent,
      time: opponentTime,
      testCases: `${opponentPassed}/${totalTestCases}`,
      efficiency: calculateEfficiency(opponentPassed, totalTestCases, opponentTime),
    });

    // Calculate rank change
    const ratingChange = calculateRatingChange(
      currRating,
      mappedResult[username].rating,
    );

    setRankChange({
      value: ratingChange.value,
      current: currRating,
      new: mappedResult[username].rating,
      percentage: outcome === "victory" ? 70 : outcome === "defeat" ? 30 : 50,
    });

  }, [location.state, username, opponent, currRating, mappedResult, totalTestCases, createdAt]);

  // Helper function to calculate efficiency score
  const calculateEfficiency = (passed, total, time) => {
    const accuracy = (passed / total) * 100;
    const timeScore = Math.max(0, 100 - time); // Penalize longer times
    return Math.round((accuracy + timeScore) / 2);
  };

  // Helper function to calculate rating change display
  const calculateRatingChange = (oldRating, newRating) => {
    const change = newRating - oldRating;
    const value = change >= 0 ? `+${change}` : `${change}`;
    return { value, change };
  };

  // Navigation handlers
  const handleFindMatch = () => {
    navigate("/find-match");
  };

  const handleGoDashboard = () => {
    navigate("/dashboard");
  };

  // Show loading state while processing data
  if (isVictory === null || !userStats || !opponentStats || !rankChange) {
    return (
      <>
        <Navbar />
        <div className="results-container">
          <div className="loading">Loading match results...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="results-container">
        {/* Match outcome section */}
        <div className={`match-outcome ${isVictory}`}>
          <div className="outcome-icon">
            <i className={
              isVictory === "victory" ? "fas fa-trophy" : 
              isVictory === "defeat" ? "fas fa-skull" : "fas fa-handshake"
            }></i>
          </div>
          <h1 className="outcome-title">
            {isVictory === "victory" ? "VICTORY" : 
             isVictory === "defeat" ? "DEFEAT" : "DRAW"}
          </h1>
        </div>

        {/* Player comparison */}
        <div className="player-comparison">
          <div className={`player-card ${
            isVictory === "victory" ? "winner" : 
            isVictory === "defeat" ? "loser" : "draw"
          }`}>
            <div className="player-avatar">
              <i className="fas fa-user"></i>
            </div>
            <h3 className="player-name">You</h3>
            <p className="player-stats">
              Time: {userStats.time} | Cases: {userStats.testCases}
            </p>
          </div>

          <div className="vs-badge">VS</div>

          <div className={`player-card ${
            isVictory === "victory" ? "loser" : 
            isVictory === "defeat" ? "winner" : "draw"
          }`}>
            <div className="player-avatar">
              <i className="fas fa-robot"></i>
            </div>
            <h3 className="player-name">{opponentStats.name}</h3>
            <p className="player-stats">
              Time: {opponentStats.time} | Cases: {opponentStats.testCases}
            </p>
          </div>
        </div>

        {/* Stats grid */}
        <div className="stats-container">
          <div className="stat-card">
            <div className="stat-icon">
              <i className="fas fa-stopwatch"></i>
            </div>
            <div className="stat-title">Completion Time</div>
            <div className="stat-value">{userStats.time}</div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <i className="fas fa-check-circle"></i>
            </div>
            <div className="stat-title">Test Cases Passed</div>
            <div className="stat-value">{userStats.testCases}</div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <i className="fas fa-bolt"></i>
            </div>
            <div className="stat-title">Efficiency Score</div>
            <div className="stat-value">{userStats.efficiency}</div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <i className="fas fa-chart-line"></i>
            </div>
            <div className="stat-title">Rating Change</div>
            <div className="stat-value">{rankChange.value}</div>
          </div>
        </div>

        {/* Rank meter */}
        <div className="rank-meter">
          <div className="meter-header">
            <div className="meter-title">Rank Rating Change</div>
            <div className={`rank-change ${
              isVictory === "victory" ? "positive" : 
              isVictory === "defeat" ? "negative" : "neutral"
            }`}>
              <i className={`fas fa-arrow-${
                isVictory === "victory" ? "up" : 
                isVictory === "defeat" ? "down" : "right"
              }`}></i>
              <span>{rankChange.value} RR</span>
            </div>
          </div>

          <div className="meter-visual">
            <div
              className={`meter-fill ${
                isVictory === "victory" ? "positive" : 
                isVictory === "defeat" ? "negative" : "neutral"
              }`}
              style={{ width: `${rankChange.percentage}%` }}
            ></div>
          </div>

          <div className="meter-labels">
            <span>Current: {rankChange.current}</span>
            <span>New: {rankChange.new}</span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="action-buttons">
          <button className="action-btn find-match" onClick={handleFindMatch}>
            <i className="fas fa-search"></i> Find Another Match
          </button>
          <button className="action-btn go-dashboard" onClick={handleGoDashboard}>
            <i className="fas fa-home"></i> Go to Dashboard
          </button>
        </div>
      </div>
    </>
  );
}