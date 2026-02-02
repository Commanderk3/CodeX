import { useState } from "react";

const TestCaseWindow = ({ tests, result, errorMsg }) => {
  const [selectedCase, setSelectedCase] = useState(null);

  const getTestCaseStatus = (index) => {
    if (result === null || result === undefined) return null;

    // All test cases passed
    if (result === -1) {
      return <span className="badge badge-success badge-sm ml-2">✔</span>;
    }

    // Failed at `result`
    if (index < result) {
      return <span className="badge badge-success badge-sm ml-2">✔</span>;
    }

    if (index === result) {
      return <span className="badge badge-error badge-sm ml-2">✖</span>;
    }

    return null;
  };

  // Button color logic (Fix 2)
  const getButtonClass = (index) => {
    if (result === null || result === undefined) return "btn-outline";

    if (result === -1) return "btn-success";

    if (index < result) return "btn-success";
    if (index === result) return "btn-error";

    return "btn-outline";
  };

  return (
    <div className="card bg-base-100 overflow-y-auto max-h-full">
      <div className="card-body space-y-1">
        <h2 className="card-title">Test Cases</h2>

        <div className="flex flex-wrap gap-2">
          {tests.map((_, index) => (
            <button
              key={index}
              onClick={() => setSelectedCase(index)}
              className={`btn btn-sm ${
                selectedCase === index ? "btn-primary" : getButtonClass(index)
              }`}
            >
              Case {index + 1}
              {getTestCaseStatus(index)}
            </button>
          ))}
        </div>

        {selectedCase !== null && tests[selectedCase] && (
          <div className="card bg-base-100">
            <div className="card-body text-sm space-y-1">
              <p>
                <span className="font-semibold">Input:</span>{" "}
                {tests[selectedCase].input.x}
              </p>
              <p>
                <span className="font-semibold">Expected Output:</span>{" "}
                {tests[selectedCase].output.toString()}
              </p>
            </div>
          </div>
        )}

        {errorMsg && (
          <div className="alert alert-error">
            <span>❌ Error: {errorMsg}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestCaseWindow;
