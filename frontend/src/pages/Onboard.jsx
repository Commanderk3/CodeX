import { useState } from "react";
import Signup from "../components/Onboard/Signup";
import Login from "../components/Onboard/Login";
import "./onboard.css";

const Onboard = () => {
  const [formMode, setFormMode] = useState("signup");

  return (
    <div className="container">
      {formMode === "signup" ? (
        <>
          <div className="header">
            <h1>Create Your Account</h1>
          </div>
          <div className="toggle-header">
            <button
              className={`toggle-btn ${formMode === "signup" ? "active" : ""}`}
              onClick={() => setFormMode("signup")}
            >
              Sign Up
            </button>
            <button
              className={`toggle-btn ${formMode === "login" ? "active" : ""}`}
              onClick={() => setFormMode("login")}
            >
              Log In
            </button>
          </div>
          <Signup />
        </>
      ) : (
        <>
          <div className="header">
            <h1>Welcome Back</h1>
          </div>
          <div className="toggle-header">
            <button
              className={`toggle-btn ${formMode === "signup" ? "active" : ""}`}
              onClick={() => setFormMode("signup")}
            >
              Sign Up
            </button>
            <button
              className={`toggle-btn ${formMode === "login" ? "active" : ""}`}
              onClick={() => setFormMode("login")}
            >
              Log In
            </button>
          </div>
          <Login />
        </>
      )}
    </div>
  );
};

export default Onboard;
