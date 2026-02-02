import { useState } from "react";
import Signup from "../components/Onboard/Signup";
import Login from "../components/Onboard/Login";

const Onboard = () => {
  const [formMode, setFormMode] = useState("signup");

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-base-100 to-base-200 p-4">
      <div className="card w-full max-w-3xl bg-base-100 shadow-2xl">
        <div className="card-body p-6 md:p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-linear-to-br from-primary to-secondary rounded-2xl mb-3">
              <i className="fas fa-code text-white text-2xl"></i>
            </div>
            <h1 className="text-2xl font-bold">
              {formMode === "signup" ? "Join CodeX" : "Welcome Back"}
            </h1>
          </div>

          {/* Toggle Tabs */}
          <div className="tabs tabs-boxed bg-base-200 p-1 mb-6">
            <button
              className={`tab flex-1 ${formMode === "signup" ? "tab-active" : ""}`}
              onClick={() => setFormMode("signup")}
            >
              Sign Up
            </button>
            <button
              className={`tab flex-1 ${formMode === "login" ? "tab-active" : ""}`}
              onClick={() => setFormMode("login")}
            >
              Log In
            </button>
          </div>

          {/* Form */}
          <div className="transition-all duration-200">
            {formMode === "signup" ? <Signup /> : <Login />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboard;