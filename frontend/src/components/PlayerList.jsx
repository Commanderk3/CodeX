import { useState, useEffect } from "react";
export default function PlayerList({ players, isReady, toggleReady }) {
  return (
    <div className="card players-card bg-base-100 border border-base-300 shadow-lg">
      <div className="card-header border-b border-base-300 p-4 text-primary font-semibold">
        Players
      </div>

      <div className="card-content players-list p-4 space-y-3">
        {players.map((p, idx) => (
          <div
            key={idx}
            className={`player-item bg-base-300 flex items-center gap-3 p-3 border transition-colors ${
              p.isReady
                ? "border-success bg-success/5 border-l-4 border-l-success"
                : "border-base-300 bg-base-100 hover:bg-base-200"
            }`}
          >
            <div className="player-avatar w-10 h-10 rounded-full bg-primary text-primary-content flex items-center justify-center">
              {p.avatar || p.playerName.charAt(0)}
            </div>
            <div className="player-info flex-1">
              <div className="player-name font-medium text-base-content">
                {p.playerName} {p.isAdmin && "👑"}
              </div>
              <div
                className={`player-status text-sm ${
                  p.isReady ? "text-success font-medium" : "text-warning"
                }`}
              >
                {p.isReady ? "Ready" : "Waiting"}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-base-300">
        <button
          className={`ready-btn w-full btn btn-lg transition-transform hover:scale-[1.02] ${
            isReady
              ? "btn-success text-success-content"
              : "btn-primary text-primary-content"
          }`}
          onClick={toggleReady}
        >
          {isReady ? "✅ Ready" : "Ready Up"}
        </button>
      </div>
    </div>
  );
}
