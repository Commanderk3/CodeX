const TestCaseYou = ({ casepassed, totalCases }) => {
  // Safe calculation with defaults
  const passed = casepassed || 0;
  const total = totalCases || 1; // Avoid division by zero
  const percentage = Math.round((passed / total) * 100);
  const filledBlocks = Math.round((percentage / 100) * 5);
  
  return (
    <div className="test-case-container">
      <div className="meter-label">
        <span className="meter-percent">{percentage}%</span>
        <span className="meter-text">TEST-CASES</span>
      </div>
      <div className="meter-blocks">
        {[...Array(5)].map((_, i) => (
          <div 
            key={i} 
            className={`meter-block ${i < filledBlocks ? "filled" : ""}`} 
          />
        ))}
      </div>
    </div>
  );
};

export default TestCaseYou;