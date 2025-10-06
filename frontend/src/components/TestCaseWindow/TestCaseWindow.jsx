import "./TestCaseWindow.css";
import { useEffect, useState, memo } from "react";

const TestCaseWindow = ({ tests, result }) => {

  const [testCases, setTestCases] = useState(null);

  // Function to decide if a test case is correct or wrong
  const getTestCaseStatus = (index) => {
    if (!result) return "";
    if (result.resultStatus.resultStatus === true) {
      return "✔️";
    }
    if (result.resultStatus.resultStatus === false && index <= result.resultStatus.mismatchedAt) {
      return "❌";
    }
    return "";
  };

  return (
    <div className="test-case-window">
      <div className="test-cases">
        {tests.map((test, index) => (
          <div key={index} className="case-number">
            <button onClick={() => setTestCases(index)}>
              Case {index + 1} {getTestCaseStatus(index)}
            </button>
          </div>
        ))}
      </div>

      <div>
        {testCases !== null && tests[testCases] && (
          <div className="selected-case">
            <p>Input: {tests[testCases].input.x}</p>
            <p>Expected Output: {tests[testCases].output.toString()}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestCaseWindow;
