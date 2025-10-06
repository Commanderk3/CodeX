import { useState } from "react";
import { loginUser } from "../../services/api";
import "./signup.css";

const Login = () => {
  const [email, setEmail] = useState("johndoe@gmail.com");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userData = {
        email,
        password
      };

      const { data } = await loginUser(userData);
      localStorage.setItem("token", data.token);

      alert(`Registration successful for ${userData.username}`);
    } catch (err) {
      console.error(err);
      alert("Error during registration");
    }
  };


  return (
    <div className="content">
      {/* Left panel */}
      <div className="left-panel">


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
