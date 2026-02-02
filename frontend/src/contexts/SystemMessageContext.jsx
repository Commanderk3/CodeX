import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import socket from "../socket";

const SystemMessageContext = createContext(null);

export function SystemMessageProvider({ children }) {
  const [messages, setMessages] = useState([]);

  const handleSystemMessage = useCallback(({ type, message }) => {
    console.log(type, message);
    setMessages((prev) => [
      ...prev.slice(-9),
      {
        id: Date.now() + Math.random(),
        type: type || "info",
        message: message,
      },
    ]);
  }, []);

  const addMessage = (type, message) => {
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        type,
        message,
      },
    ]);
  };

  useEffect(() => {
    socket.on("systemMessage", handleSystemMessage);

    return () => {
      console.log("SystemMessage listener unmounted");
      socket.off("systemMessage", handleSystemMessage);
    };
  }, [handleSystemMessage]); // Added dependency

  const clearMessage = (id) => {
    setMessages((prev) => prev.filter((m) => m.id !== id));
  };

  return (
    <SystemMessageContext.Provider
      value={{ messages, addMessage, clearMessage }}
    >
      {children}
    </SystemMessageContext.Provider>
  );
}

export function useSystemMessages() {
  return useContext(SystemMessageContext);
}
