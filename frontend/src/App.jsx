import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { UserProvider } from "./contexts/UserContext";
import { SystemMessageProvider } from "./contexts/SystemMessageContext";
import { GameProvider } from "./contexts/GameContext";
import { ThemeProvider } from "./contexts/ThemeContext";

import { Notify } from "./components/Notify";
import Onboard from "./pages/Onboard";
import Dashboard from "./pages/Dashboard";
import MatchResult from "./pages/MatchResult";
import MatchHistory from "./pages/MatchHistory";
import CodeArena from "./pages/CodeArena";
import Lobby from "./pages/Lobby";
import GameRoom from "./pages/GameRoom";
import "./app.css";
import Profile from "./pages/Profile";

export const App = () => {
  return (
    <Router>
      <UserProvider>
        <SystemMessageProvider>
          <GameProvider>
            <ThemeProvider>
              <Notify />
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/signup" element={<Onboard />} />
                <Route path="/matchresult" element={<MatchResult />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/matchhistory" element={<MatchHistory />} />
                <Route path="/codearena" element={<CodeArena />} />
                <Route path="/lobby" element={<Lobby />} />
                <Route path="/game" element={<GameRoom />} />
              </Routes>
            </ThemeProvider>
          </GameProvider>
        </SystemMessageProvider>
      </UserProvider>
    </Router>
  );
};
