import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { UserProvider } from "./contexts/UserContext";
import Onboard from "./pages/Onboard";
import CodeArena from "./pages/CodeArena";
import Dashboard from "./pages/Dashboard";
import MatchResult from "./pages/MatchResult";
import MatchHistory from "./pages/MatchHistory";
import Lobby from "./pages/Lobby";
// do we need to keep codearena here?

export const App = () => {
  return (
    <UserProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/signup" element={<Onboard />} />
          <Route path="/codearena" element={<CodeArena />} /> 
          <Route path="/matchresult" element={<MatchResult />} />
          <Route path="/matchhistory" element={<MatchHistory />} />
          <Route path="/lobby" element={<Lobby />} />
        </Routes>
      </Router>
    </UserProvider>
  );
};