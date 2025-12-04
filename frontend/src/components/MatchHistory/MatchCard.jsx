import "./matchcard.css";
import socket from "../../socket";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const MatchCard = ({ index, match, username, avatar, rating }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleRejoin = ({ roomId, players, question, createdAt, expiresAt }) => {
      console.log("Players in room:", players);
      navigate("/CodeArena", {
        state: {
          username,
          avatar,
          currRating: rating,
          roomId,
          players,
          question,
          createdAt,
          expiresAt
        },
      });
    };
    socket.on("rejoin-success", handleRejoin);
    return () => {
      socket.off("rejoin-success", handleRejoin);
    };
  }, [username]);

  const reJoinRoom = (roomId) => {
    if (!socket.connected) {
      socket.connect();
    }
    socket.emit("rejoin", { username, roomId });
  };
  const isLive = match.result.toLowerCase() === "live";

  if (isLive) {
    return (
      <div key={index} className="match-card live">
        <div className="match-header">
          <h3 className="question-title">{match.roomId}</h3>
          <span className="live-badge">
            <span className="live-dot"></span> Live
          </span>
        </div>

        <div className="match-info">
          <div>
            <strong>Opponent:</strong> {match.opponent}
          </div>
        </div>

        <div className="match-actions">
          <button className="join-room-btn" onClick={() => {reJoinRoom(match.roomId)}}>
            Join Room
          </button>
        </div>
      </div>
    );
  }

  // Normal match (not live)
  return (
    <div key={index} className={`match-card ${match.result.toLowerCase()}`}>
      <div className="match-header">
        <h3 className="question-title">{match.questionTitle}</h3>
        <span className={`result-badge ${match.result.toLowerCase()}`}>
          {match.result}
        </span>
      </div>

      <div className="match-info">
        <div>
          <strong>Room:</strong> {match.roomId}
        </div>
        <div>
          {match.opponents.avatar}
        </div>
        <div>
          <strong>Opponent:</strong> {match.opponents[0].playerName}
        </div>
      </div>

      <div className="match-stats">
        <div className="player-stats">
          <h4>You</h4>
          <p>
            {match.testCasePassed}/{match.totalTestCases} Test Cases
          </p>
          <p>⏱ {match.timeTaken} min</p>
        </div>

        <div className="player-stats">
          <h4>{match.opponents.playerName}</h4>
          <p>
            {match.opponents[0].testCasePassed}/{match.totalTestCases} Test Cases
          </p>
          <p>⏱ {match.opponents[0].timeTaken} min</p>
        </div>
      </div>
    </div>
  );
};

export default MatchCard;
