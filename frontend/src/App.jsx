import React, { useEffect, useState } from "react";
import { Splitter, SplitterPanel } from "primereact/splitter";
import { Button } from "primereact/button";
import ProblemPanel from "./components/ProblemPanel/ProblemPanel";
import CodeEditor from "./components/CodeEditor/CodeEditor";
import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";
import "./App.css";
import TestCaseWindow from "./components/TestCaseWindow/TestCaseWindow";
import questions from "./questions.json";
import axios from "axios";

const App = () => {
  const PORT = "http://localhost:5000";
  let result = true;
  const [questionId, setQuestionId] = useState(questions[0]);
  const [language, setLanguage] = useState("javascript");


  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        const response = await axios.get(`${PORT}/getquestion`);
        console.log(response.data);
        setQuestionId(response.data.question_schema);
        setCurrCode(response.data.question_schema.boilerplate[language])
      } catch (err) {
        console.log("Error ", err);
      }
    };
    fetchQuestion();
  }, []);

  const [currCode, setCurrCode] = useState(
    questionId.boilerplate["javascript"]
  );

  const runTests = () => {
    console.log("Running tests...");
  };

  const submitCode = () => {
    console.log("Submitting code...");
    console.log(currCode, language);
  };

  return (
    <div className="leetcode-clone">
      <div className="header">
        <div className="action-buttons">
          <Button
            label="Run"
            icon="pi pi-play"
            className="p-button-sm p-button-outlined"
            onClick={runTests}
          />
          <Button
            label="Submit"
            icon="pi pi-check"
            className="p-button-sm p-button-success"
            onClick={submitCode}
          />
        </div>
      </div>

      <Splitter className="main-splitter">
        <SplitterPanel
          className="problem-panel-container"
          size={40}
          minSize={30}
        >
          <ProblemPanel question={questionId} />
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
                question={questionId}
                currCode={currCode}
                setCurrCode={setCurrCode}
                language={language}
                setLanguage={setLanguage}
              />
            </SplitterPanel>
            <SplitterPanel
              className="testcase-container"
              size={30}
              minSize={20}
            >
              <TestCaseWindow question={questionId} result={result} />
            </SplitterPanel>
          </Splitter>
        </SplitterPanel>
      </Splitter>
    </div>
  );
};

export default App;
