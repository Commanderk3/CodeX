import socket from "../socket";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSystemMessages } from "../contexts/SystemMessageContext";
import { Splitter, SplitterPanel } from "primereact/splitter";

import ProblemPanel from "../components/ProblemPanel/ProblemPanel";
import CodeEditor from "../components/CodeEditor/CodeEditor";
import TestCaseWindow from "../components/TestCaseWindow/TestCaseWindow";
import Timer from "../components/Timer/Timer";
import TestCaseYou from "../components/TestCaseMeter/TestCaseYou";
import TestCaseOpp from "../components/TestCaseMeter/TestCaseOpp";

import "./styles/codearena.css";

const CodeArena = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { addMessage } = useSystemMessages();

  const {
    username,
    avatar,
    currRating,
    lang,
    roomId,
    players,
    question,
    expiresAt,
  } = location.state;

  const totalTestCases = question.test_cases.length;
  const [language, setLanguage] = useState(lang.toLowerCase() || "javascript");
  const [currCode, setCurrCode] = useState(
    question.boilerplate[lang.toLowerCase() || "javascript"],
  );
  const [errorMsg, setErrorMsg] = useState("");
  const [result, setResult] = useState(null);

  const opponent = players.find((p) => p.playerName !== username);
  const player = players.find((p) => p.playerName === username);
  console.log(player, username);

  const [playerStats, setPlayerStats] = useState(player.testCasePassed);
  const [opponentStats, setOpponentStats] = useState(opponent.testCasePassed);

  const timeLeft = expiresAt - Date.now();

  const languageIdMap = { "c++": 105, python: 71, javascript: 63, java: 62 };

  const getAvatarSrc = (name) =>
    new URL(`../assets/avatars/${name}.png`, import.meta.url).href;

  useEffect(() => {
    if (socket.disconnected) {
      navigate("/");
      return;
    }
  }, []);

  useEffect(() => {
    if (!location.state) return;

    socket.on("code-result", (data) => {
      const result = data.codeResult; // FIX

      setResult(result.mismatchedAt);
      console.log("code-result", data);

      if (result.errorMsg) {
        setErrorMsg(result.errorMsg);
      } else {
        setErrorMsg(null);
      }

      const passedCases = result.mismatchedAt || 0;
      setPlayerStats(passedCases);
    });

    socket.on("opponent-progress", (data) => {
      const passedCases = data.mismatchedAt || 0;
      setOpponentStats(passedCases);
      console.log("opponentStats", opponentStats);
    });

    socket.on("gameEnd", (result) => {
      const mappedResult = Object.values(result.result).reduce(
        (acc, player) => {
          acc[player.playerName] = player;
          return acc;
        },
        {},
      );

      navigate("/matchResult", {
        state: {
          username,
          opponent: opponent.playerName,
          oppAvatar: opponent.avatar || "sadcat",
          currRating,
          language,
          mappedResult,
          totalTestCases,
          createdAt: result.createdAt,
        },
      });
    });

    return () => {
      socket.off("code-result");
      socket.off("opponent-progress");
      socket.off("gameEnd");
    };
  }, [totalTestCases, username]);

  if (!location.state) return null;

  const runTests = () => {
    console.log("Running tests...");
  };

  const handleSubmit = () => {
    addMessage("success", "Code submitted");
    socket.emit("submit-code", {
      language_id: languageIdMap[language],
      source_code: currCode,
      roomId: roomId,
      playerName: username,
    });
  };

  return (
    <div className="leetcode-clone">
      <div className="info-display bg-base-100">
        <div className="meter-top">
          <div className="you-container">
            <div className="avatar">
              <img
                src={getAvatarSrc(avatar)}
                alt={avatar}
                className="w-12 h-12 rounded-full object-contain"
              />
            </div>
            <h1 className="text-4xl font-bold text-base-content">{username}</h1>
            <TestCaseYou casepassed={playerStats} totalCases={totalTestCases} />
          </div>

          <Timer initialTime={timeLeft} onTimeEnd={() => handleSubmit()} />

          <div className="op-container">
            <TestCaseOpp
              casepassed={opponentStats}
              totalCases={totalTestCases}
            />

            <h1 className="text-4xl font-bold text-base-content">
              {opponent?.playerName || "Opponent"}
            </h1>

            <div className="avatar">
              <img
                src={getAvatarSrc(opponent.avatar || "sadcat")}
                alt={opponent.avatar || "sadcat"}
                className="w-12 h-12 rounded-full object-contain"
              />
            </div>
          </div>
        </div>
      </div>

      <Splitter className="main-splitter">
        <SplitterPanel
          className="problem-panel-container bg-base-100"
          size={40}
          minSize={30}
        >
          <ProblemPanel question={question} />
        </SplitterPanel>

        <SplitterPanel
          className="editor-testcase-container bg-base-100"
          size={60}
          minSize={40}
        >
          <Splitter layout="vertical">
            <SplitterPanel
              className="code-editor-container bg-base-100"
              size={70}
              minSize={50}
            >
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
            <SplitterPanel
              className="testcase-container bg-base-100"
              size={40}
              minSize={20}
            >
              <TestCaseWindow
                tests={question.test_cases || []}
                result={result}
                errorMsg={errorMsg}
              />
            </SplitterPanel>
          </Splitter>
        </SplitterPanel>
      </Splitter>
    </div>
  );
};

export default CodeArena;
