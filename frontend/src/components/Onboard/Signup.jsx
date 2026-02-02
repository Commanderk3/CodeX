import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../../services/api";
import { useSystemMessages } from "../../contexts/SystemMessageContext";

const Signup = () => {
  const [selectedAvatar, setSelectedAvatar] = useState(0);
  const [username, setUsername] = useState("John Doe");
  const [selectedLanguage, setSelectedLanguage] = useState("Python");
  const [email, setEmail] = useState("johndoe@gmail.com");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const avatars = ["😀", "😎", "🤖", "🦄", "🐱", "🐶", "🦊", "🐼"];
  const languages = ["JavaScript", "C++", "Python", "Java"];
  const navigate = useNavigate();
  const { addMessage } = useSystemMessages();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

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
      addMessage("error", err.response.data.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Profile Section */}
        <div className="card bg-base-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: Avatar Preview */}
            <div className="space-y-4">
              <div className="flex flex-col items-center">
                <div className="avatar mb-6">
                  <div className="avatar">{avatars[selectedAvatar]}</div>
                </div>

                <div className="text-center">
                  <p className="text-sm text-gray-500 mb-2">
                    Click an emoji to select
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {avatars.map((avatar, index) => (
                      <button
                        key={index}
                        type="button"
                        className={`w-10 h-10 text-xl rounded-full flex items-center justify-center hover:bg-base-300 transition-colors ${
                          selectedAvatar === index
                            ? "bg-primary text-primary-content"
                            : "bg-base-100"
                        }`}
                        onClick={() => setSelectedAvatar(index)}
                      >
                        {avatar}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Account Details */}
            <div className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Username</span>
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="input input-bordered"
                  placeholder="Enter your username"
                  required
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Email</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input input-bordered"
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Password</span>
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input input-bordered"
                  placeholder="Create a password"
                  required
                />
              </div>

              {/* Language Dropdown */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">
                    Preferred Language
                  </span>
                </label>
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="select select-bordered w-full"
                >
                  {languages.map((lang) => (
                    <option key={lang} value={lang}>
                      {lang}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-center">
          <button
            type="submit"
            className="btn btn-primary btn-lg w-full md:w-1/2"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="loading loading-spinner loading-sm"></span>
                Creating Account...
              </>
            ) : (
              "Create Account"
            )}
          </button>
        </div>
      </form>
    </>
  );
};

export default Signup;
