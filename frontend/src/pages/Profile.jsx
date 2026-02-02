import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { updateProfile } from "../services/api";
import { useUser } from "../contexts/UserContext";
import { useSystemMessages } from "../contexts/SystemMessageContext";

const avatars = ["😀", "😎", "🤖", "🦄", "🐱", "🐶", "🦊", "🐼"];
const languages = ["JavaScript", "C++", "Python", "Java"];

export default function Profile() {
  const { user, setUser, loading } = useUser();
  if (!user) return;
  const [username, setUsername] = useState(user.username);
  const [avatar, setAvatar] = useState(user.avatar);
  const [language, setLanguage] = useState(user.language);
  const { addMessage } = useSystemMessages(); 

  const enableSave =
    user.username !== username ||
    user.avatar !== avatar ||
    user.language !== language;

  const handleSave = async() => {
    if (username.length === 0 || avatar === "" || language === "") {
        addMessage("error", "Username field is empty");
    } 
    console.log({ username, avatar, language });
    const data = { username, avatar, language };

    try {
        const token = localStorage.getItem("token");
        const res = await updateProfile(data, token);
        console.log(res);
        setUser(res.data);
    } catch (err) {
        addMessage("error", err.response.data.message);
        console.error(err);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="dashboard-container">
          <div className="loading-state">Loading...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="m-5 space-y-6 max-w-xl mx-auto">
        <p className="text-sm text-base-content/70">
          Update your personal information
        </p>

        {/* Profile Card */}
        <div className="card bg-base-200 border border-base-300 shadow-sm">
          <div className="card-body space-y-6">
            {/* Avatar */}
            <div>
              <h3 className="font-semibold mb-2">New avatar</h3>
              <div className="flex gap-3 flex-wrap">
                {avatars.map((a) => (
                  <button
                    key={a}
                    className={`w-12 h-12 rounded-full text-2xl flex items-center justify-center
                    ${
                      avatar === a
                        ? "bg-primary text-primary-content"
                        : "bg-base-300 hover:bg-base-100"
                    }`}
                    onClick={() => setAvatar(a)}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>

            {/* Username */}
            <div>
              <h3 className="font-semibold mb-2">New username</h3>
              <input
                type="text"
                placeholder="Enter username"
                className="input input-bordered w-full bg-base-100"
                required
                minLength={3}
                value={username}
                onChange={(e) => setUsername(e.target.value.trimStart())}
              />
            </div>

            {/* Language */}
            <div>
              <h3 className="font-semibold mb-2">Language</h3>
              <select
                className="select select-bordered w-full bg-base-100"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              >
                {languages.map((lang) => (
                  <option key={lang}>{lang}</option>
                ))}
              </select>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <button className="btn btn-ghost">Cancel</button>
              <button className="btn btn-primary" disabled={!enableSave} onClick={handleSave}>
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
