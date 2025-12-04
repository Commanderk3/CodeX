// contexts/UserContext.js
import { createContext, useContext, useState, useEffect } from 'react';
import { userDetails } from '../services/api';

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    console.log("Fetching user details...");
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setUser(null);
        return;
      }
      const res = await userDetails(token);
      console.log("Fetched user details:", res.data);
      setUser(res.data);
    } catch (err) {
      console.error("Error fetching user:", err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, loading, fetchUser }}>
      {children}
    </UserContext.Provider>
  );
};