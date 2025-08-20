import "./TestCaseWindow.css";
import { useEffect, useState } from "react";

const TestCaseWindow = ({question, result}) => {
  const [testCases, setTestCases] = useState(null);
  const [status, setStatus] = useState(null);

  useEffect(()=> {
    if (result === true) {
      setStatus("Accepted")
    } else if (result === false) {
      setStatus("Failed");
    } else {
      setStatus("");
    }
  }, [result]);

  return (
    <div className="test-case-window">
      <div>{status}</div>
      <div>
        {question.test_cases.map((test, index) => {
          return (
            <div key={index} className="case-number">
              <button
                onClick={() => setTestCases(index)}
              >
                Case {index + 1}
              </button>
            </div>
          );
        })}
      </div>
      <div>
        {testCases !== null && (
          <div className="selected-case">
            <p>Input: {question.test_cases[testCases].input.x}</p>
            <p>
              Expected Output:{" "}
              {question.test_cases[testCases].output.toString()}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestCaseWindow;
