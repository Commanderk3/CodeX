import { useUser } from "../contexts/UserContext";
import Navbar from "../components/Navbar";
import "./styles/matchhistory.css";
import MatchCard from "../components/MatchHistory/MatchCard";
import { useEffect } from "react";

const MatchHistory = () => {
  const { user, loading, fetchUser } = useUser();

  useEffect(() => {
    fetchUser();
  }, []);

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
        <div className="matches-container">
          {!user.matchHistory || user.matchHistory.length === 0 ? (
            <div className="no-matches">
              <p>No matches played yet</p>
              <p className="subtext">
                Start coding to build your match history!
              </p>
            </div>
          ) : (
            <div className="matches-list m-10 ml-50 mr-50">
              {user.matchHistory.map((match, index) => (
                <MatchCard
                  key={index}
                  match={match}
                  username={user.username}
                  lang={user.language}
                  avatar={user.avatar}
                  rating={user.rating}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default MatchHistory;
