import axios from "axios";

const API = axios.create({ baseURL: "http://localhost:5000/api" });

// auth
const registerUser = (data) => API.post("/auth/register", data);
const loginUser = (data) => API.post("/auth/login", data);

// user details
const userDetails = (token) =>
  API.get("/user/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

const roomList = (token) =>
  API.get("/roomlist", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

const leaderboardList = (token) =>
  API.get("/leaderboard", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

const updateProfile = (data, token) =>
  API.post(
    "/user/profile",
    data,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );


export {
  registerUser,
  loginUser,
  userDetails,
  roomList,
  leaderboardList,
  updateProfile,
};
