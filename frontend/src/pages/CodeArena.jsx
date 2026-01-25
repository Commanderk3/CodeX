import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Splitter, SplitterPanel } from "primereact/splitter";

import ProblemPanel from "../components/ProblemPanel/ProblemPanel";
import CodeEditor from "../components/CodeEditor/CodeEditor";
import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";
import "../App.css";
import TestCaseWindow from "../components/TestCaseWindow/TestCaseWindow";
import "./styles/codearena.css";
import Timer from "../components/Timer/Timer";
import TestCaseYou from "../components/TestCaseMeter/TestCaseYou";
import TestCaseOpp from "../components/TestCaseMeter/TestCaseOpp";

import socket from "../socket";

const CodeArena = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const {
    username,
    avatar,
    currRating,
    lang,
    roomId,
    players,
    question,
    createdAt,
    expiresAt,
  } = location.state;

  const totalTestCases = question.test_cases.length;
  const [language, setLanguage] = useState("javascript");
  const [currCode, setCurrCode] = useState(question.boilerplate["javascript"]);
  const [errorMsg, setErrorMsg] = useState("");
  const [result, setResult] = useState(null);
  const [playerStats, setPlayerStats] = useState(0);
  const opponent = players.find((p) => p.playerName !== username);
  const [opponentStats, setOpponentStats] = useState(opponent.testCasePassed);
  const timeLeft = expiresAt - Date.now();
  // console.log("Time left:", timeLeft);
  // console.log("Time left", expiresAt - createdAt);

  const languageIdMap = { "c++": 105, python: 71, javascript: 63, java: 62 };

  useEffect(() => {
    if (socket.disconnected) {
      navigate("/");
      return;
    }
  }, []);

  useEffect(() => {
    if (!location.state) return;

    socket.on("code-result", (data) => {
      const result = data.codeResult;     // FIX

      setResult(result.resultStatus);
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
        {}
      );

      navigate("/matchResult", {
        state: {
          username,
          opponent: opponent.playerName,
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
    socket.emit("submit-code", {
      language_id: languageIdMap[language],
      source_code: currCode,
      roomId: roomId,
      playerName: username,
    });
  };

  return (
    <div className="leetcode-clone">
      <div className="info-display">
        <div className="meter-top">
          <div className="you-container">
            <div className="avatar">{avatar}</div>
            <h1>{username}</h1>
            <TestCaseYou casepassed={playerStats} totalCases={totalTestCases} />
          </div>

          <Timer initialTime={timeLeft} />

          <div className="op-container">
            <TestCaseOpp
              casepassed={opponentStats}
              totalCases={totalTestCases}
            />

            <h1>{opponent.playerName}</h1>

            <div className="avatar">{opponent.avatar}</div>
          </div>
        </div>
      </div>

      <Splitter className="main-splitter">
        <SplitterPanel
          className="problem-panel-container"
          size={40}
          minSize={30}
        >
          <ProblemPanel question={question} />
        </SplitterPanel>

        <SplitterPanel
          className="editor-testcase-container"
          size={60}
          minSize={40}
        >
          <Splitter layout="vertical">
            <SplitterPanel
              className="code-editor-container"
              size={30}
              minSize={40}
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
              className="testcase-container"
              size={30}
              minSize={20}
            >
              <TestCaseWindow tests={question.test_cases} result={result} errorMsg={errorMsg} />
            </SplitterPanel>
          </Splitter>
        </SplitterPanel>
      </Splitter>
    </div>
  );
};

export default CodeArena;
