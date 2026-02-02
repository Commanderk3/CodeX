import { useState, useEffect } from "react";
import { leaderboardList } from "../services/api";

export default function Leaderboard() {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchLeaderboard = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await leaderboardList(token);
      console.log(res.data);
      setPlayers(res.data);
    } catch (err) {
      console.error("Error loading leaderboard:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchLeaderboard();
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-base-content">Leaderboard</h2>

        <button
          className="btn btn-ghost btn-circle hover:bg-base-200"
          onClick={handleRefresh}
          title="Refresh"
          disabled={refreshing}
        >
          {refreshing ? (
            <span className="loading loading-spinner loading-xs"></span>
          ) : (
            <svg
              className="w-5 h-5 text-base-content"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                d="M21 12a9 9 0 11-3.72-7.02"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M21 3v6h-6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </button>
      </div>

      {/* List */}
      <div className="overflow-y-auto max-h-100 pr-2">
        <div className="space-y-3">
          {players.length === 0 ? (
            <div className="alert alert-info bg-info/10 border-info/20">
              <span className="text-base-content">
                No players on the leaderboard yet
              </span>
            </div>
          ) : (
            players.map((player, index) => (
              <div
                key={player.id || player.username}
                className="card bg-base-200 shadow-sm border border-base-300"
              >
                <div className="card-body py-4">
                  <div className="flex items-center justify-between gap-4">
                    {/* Player info */}
                    <div className="flex items-center gap-4">
                      {/* Rank */}
                      <span className="badge badge-outline border-base-300 text-base-content">
                        #{index + 1}
                      </span>

                      {/* Avatar + Name */}
                      <div className="flex items-center gap-3">
                        <div className="avatar placeholder">
                          <div className="w-10 h-10 rounded-full bg-primary text-primary-content flex items-center justify-center text-lg">
                            {player.avatar ||
                              player.username?.charAt(0).toUpperCase() ||
                              "?"}
                          </div>
                        </div>

                        <div className="font-semibold text-base-content">
                          {player.username}
                        </div>
                      </div>
                    </div>

                    {/* Rating */}
                    <div className="flex items-center gap-2 text-right">
                      <div className="text-sm text-base-content/70">Rating</div>
                      <div className="text-xl font-bold text-base-content">
                        {player.rating || 0}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
