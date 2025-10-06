
const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="nav-logo">
        <i className="fas fa-code"></i>
        <span>CodeMatch</span>
      </div>

      <ul className="nav-links">
        <li><a href="#">Dashboard</a></li>
        <li><a href="#">Matches</a></li>
        <li><a href="#">Leaderboard</a></li>
        <li><a href="#">Profile</a></li>
      </ul>

      <div className="nav-actions">
        <button className="nav-btn">Sign In</button>
      </div>
    </nav>
  );
};

export default Navbar;
