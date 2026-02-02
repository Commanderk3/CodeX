import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { updateProfile } from "../services/api";
import { useUser } from "../contexts/UserContext";
import { useSystemMessages } from "../contexts/SystemMessageContext";

const avatars = [
  "coolbanana",
  "coolcat",
  "creeper",
  "danksmile",
  "dog",
  "dragon",
  "fox",
  "frog",
  "golem",
  "mcmonster",
  "monkey",
  "owl",
  "sadcat",
  "shibudog",
  "woman",
];

const getAvatarSrc = (name) =>
  new URL(`../assets/avatars/${name}.png`, import.meta.url).href;

const languages = ["JavaScript", "C++", "Python", "Java"];

export default function Profile() {
  const { user, setUser, loading } = useUser();
  const { addMessage } = useSystemMessages();

  const [username, setUsername] = useState("");
  const [avatar, setAvatar] = useState("");
  const [language, setLanguage] = useState("");

  useEffect(() => {
    if (user) {
      setUsername(user.username);
      setAvatar(user.avatar);
      setLanguage(user.language);
    }
  }, [user]);

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

  if (!user) {
    return null;
  }

  const enableSave =
    user.username !== username ||
    user.avatar !== avatar ||
    user.language !== language;

  const reset = () => {
    setUsername(user.username);
    setAvatar(user.avatar);
    setLanguage(user.language);
  }

  const handleSave = async () => {
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


        <div className="avatar mb-6 flex justify-center flex-col items-center gap-2">
          <img
            src={getAvatarSrc(avatar)}
            alt={avatar}
            className="w-28 h-28 rounded-full object-contain"
          />
          <h1>{username}</h1>
        </div>

        {/* Profile Card */}
        <div className="card bg-base-200 border border-base-300 shadow-sm">
          <div className="card-body space-y-6">
            {/* Avatar */}
            <div>
              <h3 className="font-semibold mb-2">New avatar</h3>
              <div className="flex gap-3 flex-wrap">
                {avatars.map((avatarName, index) => (
                  <button
                    key={index}
                    type="button"
                    className={`w-11 h-11 rounded-full flex items-center justify-center hover:bg-base-300 transition-colors ${
                      avatar === avatarName
                        ? "bg-primary ring-1 ring-primary"
                        : "bg-base-100"
                    }`}
                    onClick={() => setAvatar(avatarName)}
                  >
                    <img
                      src={getAvatarSrc(avatarName)}
                      alt={avatarName}
                      className="w-10 h-10 rounded-full object-contain"
                    />
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
              <button className="btn btn-ghost" onClick={reset}>Cancel</button>
              <button
                className="btn btn-primary"
                disabled={!enableSave}
                onClick={handleSave}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
