import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Splitter, SplitterPanel } from "primereact/splitter";
import socket from "../socket";

import ProblemPanel from "../components/ProblemPanel/ProblemPanel";
import CodeEditor from "../components/CodeEditor/CodeEditor";
import PlayerProgress from "../components/PlayerProgress/Playerprogress";
import TestCaseWindow from "../components/TestCaseWindow/TestCaseWindow";
import Chat from "../components/ChatWindow/Chat";

import { useGame } from "../contexts/GameContext";
import { useUser } from "../contexts/UserContext";

import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";
import "./styles/game.css";
import "./styles/GameEndModal.css";

const GameRoom = () => {
  const navigate = useNavigate();
  const { room, players, question, setPlayers } = useGame();
  const { user } = useUser();
  const [gameEndData, setGameEndData] = useState(null);

  useEffect(() => {
    if (!user) return;
    if (!room?.roomId) navigate("/", { replace: true });
  }, [room, user, navigate]);

  const languageIdMap = { "c++": 105, python: 71, javascript: 63, java: 62 };

  const [currCode, setCurrCode] = useState(question.boilerplate["javascript"]);
  const [language, setLanguage] = useState("javascript");
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  const totalTestCases = question.test_cases.length;
  const username = user.username;

  const initialPlayerList = players.map((p) => ({
    name: p.playerName,
    avatar: p.avatar,
    progress: 0,
  }));

  const [inGamePlayers, setInGamePlayers] = useState(initialPlayerList);

  const { roomId } = room;

  const handleSubmit = () => {
    socket.emit("submit-code", {
      language_id: languageIdMap[language],
      source_code: currCode,
      roomId,
      playerName: username,
    });
  };

  const handleCodeResult = (data) => {
    console.log(data);
    if (data.codeResult.errorMsg) {
      setErrorMsg(data.codeResult.errorMsg);
      return;
    }
    const passedCases = data.codeResult.mismatchedAt || 0;
    setResult(passedCases);
    setErrorMsg("");

    setInGamePlayers((prev) =>
      prev.map((p) =>
        p.name === username ? { ...p, progress: passedCases } : p
      )
    );
  };

  const opponentStatsHandler = (data) => {
    const playerName = data.playerName;
    const passedCases = data.mismatchedAt || 0;

    setInGamePlayers((prev) =>
      prev.map((p) =>
        p.name === playerName ? { ...p, progress: passedCases } : p
      )
    );
  };

  const gameEndHandler = (resultData) => {
    setGameEndData(resultData);
    console.log(players);
    players.forEach(p => {
      p.isReady = false;
    });
  };

  const handleLobbyRedirect = () => {
    navigate('/lobby');
  };

  useEffect(() => {
    const updatePlayers = ({ players }) => setPlayers(players);
    socket.on("newPlayerJoined", updatePlayers);
    socket.on("player-ready", updatePlayers);
    socket.on("code-result", handleCodeResult);
    socket.on("opponent-progress", opponentStatsHandler);
    socket.on("roomGameEnd", gameEndHandler)

    return () => {
      socket.off("newPlayerJoined", updatePlayers);
      socket.off("player-ready", updatePlayers);
      socket.off("code-result", handleCodeResult);
      socket.off("opponent-progress", opponentStatsHandler);
      socket.off("roomGameEnd", gameEndHandler);
    };
  }, [username, roomId]);

  const runTests = () => {
    console.log("Running tests...");
    alert("Tests run!");
  };

  if (!room?.roomId || !players || players.length === 0 || !user) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <p>Loading game...</p>
      </div>
    );
  }

  if (!question) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <p>Waiting for question...</p>
      </div>
    );
  }

  return (
    <div className="leetcode-clone" style={{ height: "100vh", width: "100vw" }}>
      {/* Game End Modal */}
      {gameEndData && (
        <div className="game-end-overlay">
          <div className="game-end-modal">
            <div className="game-end-header">
              <h1 className="game-end-title">🏆 Game Results 🏆</h1>
              <p className="game-end-subtitle">
                Started at: {new Date(gameEndData.createdAt).toLocaleString()}
              </p>
            </div>

            <div className="leaderboard-container">
              <h2 className="leaderboard-title">Final Leaderboard</h2>

              <div className="leaderboard-list">
                {gameEndData.leaderboard.map((player, index) => {
                  const isCurrentUser = player.playerName === username;
                  const rankClass = `rank-${index + 1}`;

                  return (
                    <div
                      key={index}
                      className={`leaderboard-item ${rankClass} ${isCurrentUser ? 'current-user' : ''}`}
                    >
                      <div className={`rank-badge ${rankClass}`}>
                        {index + 1}
                      </div>

                      <div className="player-info">
                        <div className="player-header">
                          <span className="player-name">
                            {player.playerName}
                            {isCurrentUser && (
                              <span className="user-badge">YOU</span>
                            )}
                          </span>
                          <div className="player-stats">
                            <span className="test-count">
                              {player.testCasePassed} / {totalTestCases} Tests
                            </span>
                            <span className="completion-percentage">
                              {Math.round((player.testCasePassed / totalTestCases) * 100)}% Complete
                            </span>
                          </div>
                        </div>

                        <div className="progress-bar">
                          <div
                            className="progress-fill"
                            style={{ width: `${(player.testCasePassed / totalTestCases) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="lobby-button-container">
              <button
                onClick={handleLobbyRedirect}
                className="lobby-button"
              >
                <span style={{ fontSize: '1.2rem' }}>←</span>
                Back to Lobby
              </button>

              <p className="game-end-note">
                Thanks for playing! See you in the next game.
              </p>
            </div>
          </div>
        </div>
      )}

      <Splitter className="main-splitter" style={{ height: "100%", width: "100%" }}>
        <SplitterPanel className="problem-panel-container" size={35} minSize={25} style={{ overflow: "auto" }}>
          <ProblemPanel question={question} />
        </SplitterPanel>

        <SplitterPanel className="editor-testcase-container" size={45} minSize={35}>
          <Splitter layout="vertical" style={{ height: "100%" }}>
            <SplitterPanel className="code-editor-container" size={70} minSize={30} style={{ overflow: "hidden" }}>
              <CodeEditor
                question={question}
                currCode={currCode}
                setCurrCode={setCurrCode}
                language={language}
                setLanguage={setLanguage}
                handleSubmit={handleSubmit}
                runTests={runTests}
              />
            </SplitterPanel>
            <SplitterPanel className="testcase-container" size={30} minSize={20} style={{ overflow: "auto" }}>
              <TestCaseWindow tests={question.test_cases} result={result} errorMsg={errorMsg} />
            </SplitterPanel>
          </Splitter>
        </SplitterPanel>

        <SplitterPanel className="right-panel-container" >
          <Splitter layout="vertical" >
            <SplitterPanel className="player-progress-panel" >
              <PlayerProgress players={inGamePlayers} totalTestCases={totalTestCases} />
            </SplitterPanel>

            <SplitterPanel>
              <Chat roomId={roomId} user={user} />
            </SplitterPanel>
          </Splitter>
        </SplitterPanel>
      </Splitter>
    </div>
  );
};

export default GameRoom;