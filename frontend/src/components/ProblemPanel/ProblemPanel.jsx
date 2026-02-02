import "./ProblemPanel.css";

const ProblemPanel = ({ question }) => {
  return (
    <div className="problem-panel bg-base-100">
      <div className="problem-header">
        <h2>
          {question.title}
          <span className={`difficulty ${question.difficulty.toLowerCase()}`}>
            {question.difficulty}
          </span>
        </h2>
      </div>
      <div
        className="problem-content"
        dangerouslySetInnerHTML={{
          __html: question.description.replace(/\n/g, "<br />"),
        }}
      />
    </div>
  );
};

export default ProblemPanel;
