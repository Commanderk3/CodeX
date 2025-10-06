import axios from "axios";

const API = axios.create({ baseURL: "http://localhost:5000/api" });

// auth
export const registerUser = (data) => API.post("/auth/register", data);
export const loginUser = (data) => API.post("/auth/login", data);

// user details
export const userDetails = (token) =>
  API.get("/user/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
