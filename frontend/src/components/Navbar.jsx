import { NavLink, useNavigate } from "react-router-dom";
import { useUser } from "../contexts/UserContext";

const Navbar = () => {
  const navigate = useNavigate();
  const { user, loading } = useUser();

  return (
    <nav className="navbar">
      <div className="nav-logo">
        <i className="fas fa-code"></i>
        <span>CodeMatch</span>
      </div>

      <ul className="nav-links">
        <li>
          <NavLink
            to="/"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            Dashboard
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/matchhistory"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            Matches
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/leaderboard"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            Leaderboard
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/profile"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            Profile
          </NavLink>
        </li>
      </ul>

      <div className="nav-actions">
        {user ? (
          <button
            style={{ background: "#FF513D" }}
            className="nav-btn"
            onClick={() => {
              navigate("/logout");
            }}
          >
            Log Out
          </button>
        ) : (
          <button
            className="nav-btn"
            onClick={() => {
              navigate("/signup");
            }}
          >
            Sign In
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
