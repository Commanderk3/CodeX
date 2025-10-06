import React from 'react';
import { useUser } from '../contexts/UserContext';
import Navbar from '../components/Navbar';
import './matchhistory.css';

const MatchHistory = () => {
  const { user, loading } = useUser();

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="match-history">
          <div className="loading">Loading match history...</div>
        </div>
      </>
    );
  }

  if (!user) {
    return (
      <>
        <Navbar />
        <div className="match-history">
          <div className="no-user">Please log in to view match history</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="match-history">
        <div className="match-history-header">
          <h1>Match History</h1>
          <div className="stats-overview">
            <div className="stat">
              <span className="stat-value">{user.matchesPlayed || 0}</span>
              <span className="stat-label">Total Matches</span>
            </div>
            <div className="stat">
              <span className="stat-value">{user.winRate || 0}%</span>
              <span className="stat-label">Win Rate</span>
            </div>
          </div>
        </div>

        <div className="matches-container">
          {!user.matchHistory || user.matchHistory.length === 0 ? (
            <div className="no-matches">
              <p>No matches played yet</p>
              <p className="subtext">Start coding to build your match history!</p>
            </div>
          ) : (
            <div className="matches-list">
              {user.matchHistory.map((match, index) => (
                <div key={index} className={`match-card ${match.result.toLowerCase()}`}>
                  <div className="match-main-info">
                    <div className="match-opponent">
                      <span className="label">Opponent:</span>
                      <span className="value">{match.opponent}</span>
                    </div>
                    <div className="match-room">
                      <span className="label">Room:</span>
                      <span className="value">{match.roomId}</span>
                    </div>
                  </div>
                  <div className="match-result">
                    <span className={`result-badge ${match.result.toLowerCase()}`}>
                      {match.result}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default MatchHistory;