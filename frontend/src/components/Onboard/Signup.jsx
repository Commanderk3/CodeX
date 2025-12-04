import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../../services/api";

import "./signup.css";

const Signup = () => {
  const [selectedAvatar, setSelectedAvatar] = useState(0);
  const [username, setUsername] = useState("John Doe");
  const [selectedLanguage, setSelectedLanguage] = useState("Python");
  const [email, setEmail] = useState("johndoe@gmail.com");
  const [password, setPassword] = useState("");

  const avatars = ["😀", "😎", "🤖", "🦄", "🐱", "🐶", "🦊", "🐼"];
  const languages = ["JavaScript", "C++", "Python", "Java"];
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userData = {
        username,
        email,
        password,
        avatar: avatars[selectedAvatar],
        language: selectedLanguage,
      };

      const { data } = await registerUser(userData);

      localStorage.setItem("token", data.token);

      navigate("/");
      window.location.reload();

    } catch (err) {
      console.error(err);
      alert("Error during registration");
    }
  };

  return (
    <div className="content">
      {/* Left panel */}
      <div className="left-panel">
        <div className="section-title">
          <i className="fas fa-user-circle"></i>
          Avatar & Nickname
        </div>

        {/* Avatar preview */}
        <div className="avatar-preview">
          <div className="preview-container">
            <div className="avatar-display">{avatars[selectedAvatar]}</div>
          </div>
        </div>

        <div className="input-group">
          <label htmlFor="nickname">Username</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

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

      {/* Right panel */}
      <div className="right-panel">
        <div className="section-title">
          <i className="fas fa-palette"></i>
          Choose Avatar
        </div>

        {/* Avatar selection */}
        <div className="avatar-grid">
          {avatars.map((avatar, index) => (
            <div
              key={index}
              className={`avatar ${selectedAvatar === index ? "selected" : ""}`}
              onClick={() => setSelectedAvatar(index)}
            >
              {avatar}
            </div>
          ))}
        </div>

        <div className="section-title">
          <i className="fas fa-code"></i>
          Choose Language
        </div>

        {/* Language selection */}
        <div className="language-grid">
          {languages.map((lang, index) => (
            <div
              key={index}
              className={`language-option ${
                selectedLanguage === lang ? "selected" : ""
              }`}
              onClick={() => setSelectedLanguage(lang)}
            >
              {lang}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Signup;
