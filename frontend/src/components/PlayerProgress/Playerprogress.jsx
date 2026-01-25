import './PlayerProgress.css';

const PlayerProgress = ({ players, totalTestCases }) => {
  const sortedPlayers = [...players].sort((a, b) => {
    const aPercentage = (a.progress / totalTestCases) * 100;
    const bPercentage = (b.progress / totalTestCases) * 100;
    if (bPercentage !== aPercentage) {
      return bPercentage - aPercentage;
    }
    return a.name.localeCompare(b.name);
  });

  // Function to get rank indicator
  const getRankIndicator = (index) => {
    return `${index + 1}`;
  };

  // Function to get progress bar color
  const getProgressColor = (progress, total) => {
    const percentage = (progress / total) * 100;
    if (percentage === 100) return '#10b981';
    if (percentage >= 50) return '#3b82f6';
    if (percentage > 0) return '#f59e0b';
    return '#6b7280';
  };

  return (
    <div className="leaderboard-container">
      <div className="card-header">
        <h3>Leaderboard</h3>
      </div>

      <div className="players-list">
        {sortedPlayers.map((player, index) => {
          const percentage =
            totalTestCases > 0
              ? (player.progress / totalTestCases) * 100
              : 0;

          const color = getProgressColor(player.progress, totalTestCases);

          return (
            <div
              key={player.name}
              className="player-row"
            >
              <div className="player-rank">
                <span className="rank-number">
                  {getRankIndicator(index)}
                </span>
              </div>

              <div className="player-avatar">
                {player.name.charAt(0).toUpperCase()}
              </div>

              <div className="player-info">
                <div className="player-name-container">
                  <span className="player-name">
                    {player.name}
                  </span>
                  {player.isCurrentUser && (
                    <span className="current-user-indicator">•</span>
                  )}
                </div>

                <div className="player-progress-bar-container">
                  <div className="progress-bar-background">
                    <div
                      className="progress-bar-fill"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: color,
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="player-percentage">
                <span className="percentage-value">
                  {Math.round(percentage)}%
                </span>
              </div>
            </div>
          );
        })}

      </div>
    </div>
  );
};

export default PlayerProgress;