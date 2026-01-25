import { useState, useEffect } from "react";
export default function PlayerList({ players, isReady, toggleReady }) {


    return (
        <div className="card players-card">
            <div className="card-header">Players</div>
            <div className="card-content players-list">
                {players.map((p, idx) => (
                    <div key={idx} className={`player-item ${p.isReady ? "ready" : ""}`}>
                        <div className="player-avatar">{p.avatar || p.playerName}</div>
                        <div className="player-info">
                            <div className="player-name">
                                {p.playerName} {p.isAdmin && "👑"}
                            </div>
                            <div className={`player-status ${p.isReady ? "status-ready" : "status-waiting"}`}>
                                {p.isReady ? "Ready" : "Waiting"}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <button className={`ready-btn ${isReady ? "ready" : "not-ready"}`} onClick={toggleReady}>
                {isReady ? "✅ Ready" : "Ready Up"}
            </button>
        </div>
    );
}


