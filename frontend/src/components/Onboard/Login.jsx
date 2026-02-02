import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../../services/api";
import "./signup.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userData = {
        email,
        password
      };

      const { data } = await loginUser(userData);
      localStorage.setItem("token", data.token);
      navigate("/");
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert("Error during registration");
    }
  };

  return (
    <div className="login-content">
      {/* Left panel */}
      <div className="login-panel">

        {/* Email input */}
        <div className="input-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {/* Password input */}
        <div className="input-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button className="btn btn-primary" onClick={handleSubmit}>
          CONTINUE
        </button>
      </div>
    </div>
  );
};

export default Login;
