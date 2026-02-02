const PlayerProgress = ({ players, totalTestCases }) => {

  const getAvatarSrc = (name) =>
    new URL(`../../assets/avatars/${name}.png`, import.meta.url).href;

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
    if (percentage === 100) return "#10b981";
    if (percentage >= 50) return "#3b82f6";
    if (percentage > 0) return "#f59e0b";
    return "#6b7280";
  };

  return (
    <div className="leaderboard-container card bg-base-100 border border-base-300 shadow-md h-full flex flex-col">
      <div className="card-header border-b border-base-300 p-4">
        <h3 className="text-lg font-semibold text-base-content">Leaderboard</h3>
      </div>

      <div className="players-list card-body p-4 overflow-y-auto flex-1 space-y-2">
        {sortedPlayers.map((player, index) => {
          const percentage =
            totalTestCases > 0 ? (player.progress / totalTestCases) * 100 : 0;

          const color = getProgressColor(player.progress, totalTestCases);

          return (
            <div
              key={player.name}
              className={`player-row flex items-center gap-3 p-3 rounded-box transition-colors ${
                player.isCurrentUser
                  ? "bg-primary/10 border border-primary/20"
                  : "bg-base-200 hover:bg-base-300"
              }`}
            >
              <div className="player-rank w-8">
                <span className="rank-number text-base-content font-medium">
                  {getRankIndicator(index)}
                </span>
              </div>

              <div className="player-avatar avatar placeholder">
                <img
                  src={getAvatarSrc(player.avatar || "sadcat")}
                  alt={player.avatar || "sadcat"}
                  className="w-8 h-8 rounded-full object-contain"
                />
              </div>

              <div className="player-info flex-1 min-w-0">
                <div className="player-name-container flex items-center gap-2 mb-1">
                  <span className="player-name text-base-content font-medium truncate">
                    {player.name}
                  </span>
                  {player.isCurrentUser && (
                    <span className="current-user-indicator text-primary">
                      •
                    </span>
                  )}
                </div>

                <div className="player-progress-bar-container">
                  <div className="progress progress-sm w-full bg-base-300">
                    <div
                      className="progress-bar"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: color,
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="player-percentage w-12 text-right">
                <span className="percentage-value font-semibold text-base-content">
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
