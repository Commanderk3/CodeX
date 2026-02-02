import socket from "../../socket";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const MatchCard = ({ index, match, username, lang, avatar, rating }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleRejoin = ({
      roomId,
      players,
      question,
      expiresAt,
    }) => {
      console.log("Players in room:", players);
      navigate("/codearena", {
        state: {
          username,
          avatar,
          currRating: rating,
          lang,
          roomId,
          players,
          question,
          expiresAt,
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
      <div
        key={index}
        className="card bg-base-100 border-2 border-error shadow-lg mb-4"
      >
        <div className="card-body p-4">
          <div className="flex justify-between items-start mb-3">
            <h3 className="card-title text-lg text-base-content">
              {match.roomId}
            </h3>
            <div className="badge badge-error gap-2">
              <div className="w-2 h-2 bg-base-100 rounded-full animate-pulse"></div>
              LIVE
            </div>
          </div>

          <div className="mb-4">
            <p className="text-base-content">
              <span className="font-medium text-base-content/80">
                Opponent:
              </span>{" "}
              {match.opponent}
            </p>
          </div>

          <div className="card-actions justify-end">
            <button
              className="btn btn-error btn-sm text-error-content"
              onClick={() => {
                reJoinRoom(match.roomId);
              }}
            >
              Join Room
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Normal match (not live)
  const result = match.result.toLowerCase();
  const resultBadgeClass =
    result === "victory"
      ? "badge-success"
      : result === "defeat"
        ? "badge-error"
        : "badge-warning";

  return (
    <div
      key={index}
      className="card bg-base-100 border border-base-300 shadow-md mb-4"
    >
      <div className="card-body p-4">
        <div className="flex justify-between items-start mb-4">
          <h3 className="card-title text-lg text-base-content">
            {match.questionTitle}
          </h3>
          <div className={`badge ${resultBadgeClass}`}>{match.result}</div>
        </div>

        <div className="space-y-2 mb-4">
          <p className="text-base-content">
            <span className="font-medium text-base-content/80">Room:</span>{" "}
            {match.roomId}
          </p>
          <p className="text-base-content">
            <span className="font-medium text-base-content/80">Opponent:</span>{" "}
            {match.opponents[0].playerName}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-base-200 p-3 rounded-box">
            <h4 className="font-semibold text-base-content mb-2">You</h4>
            <div className="space-y-1">
              <p className="text-base-content text-sm">
                {match.testCasePassed}/{match.totalTestCases} Test Cases
              </p>
              <p className="text-base-content text-sm">
                ⏱ {match.timeTaken} min
              </p>
            </div>
          </div>

          <div className="bg-base-200 p-3 rounded-box">
            <h4 className="font-semibold text-base-content mb-2">
              {match.opponents[0].playerName}
            </h4>
            <div className="space-y-1">
              <p className="text-base-content text-sm">
                {match.opponents[0].testCasePassed}/{match.totalTestCases} Test
                Cases
              </p>
              <p className="text-base-content text-sm">
                ⏱ {match.opponents[0].timeTaken} min
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MatchCard;
