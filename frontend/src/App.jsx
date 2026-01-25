import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { UserProvider } from "./contexts/UserContext";
import { GameProvider } from "./contexts/GameContext";

import Onboard from "./pages/Onboard";
import Dashboard from "./pages/Dashboard";
import MatchResult from "./pages/MatchResult";
import MatchHistory from "./pages/MatchHistory";
import CodeArena from "./pages/CodeArena";
import Lobby from "./pages/Lobby";
import GameRoom from "./pages/GameRoom";
import "./app.css";

export const App = () => {
  return (
    <UserProvider>
      <GameProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/signup" element={<Onboard />} />
            <Route path="/matchresult" element={<MatchResult />} />
            <Route path="/matchhistory" element={<MatchHistory />} />
            <Route path="/codearena" element={<CodeArena />} />
            <Route path="/lobby" element={<Lobby />} />
            <Route path="/game" element={<GameRoom />} />
          </Routes>
        </Router>
      </GameProvider>
    </UserProvider>
  );
};
