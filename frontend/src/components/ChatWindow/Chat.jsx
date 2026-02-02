import { useState, useEffect, useRef } from "react";
import socket from "../../socket";
const Chat = ({ roomId, user, page }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setMessages((prev) => [
      ...prev,
      { id: Date.now(), user: "You", text: newMessage },
    ]);
    socket.emit("send-msg", { roomId, msg: newMessage, player: user.username });
    setNewMessage("");
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const updateChatMessage = ({ sender, message }) =>
      setMessages((prev) => [
        ...prev,
        { id: Date.now(), user: sender, text: message },
      ]);
    socket.on("broadcast-msg", updateChatMessage);
    return () => {
      socket.off("broadcast-msg", updateChatMessage);
    };
  }, []);

  return (
    <div className="card chat-card bg-base-100 border border-base-300 shadow-lg">
      <div className="card-header border-b border-base-300 p-4 text-primary font-semibold">
        Chat
      </div>

      <div
        className={`messages-container p-5 space-y-3 overflow-y-auto ${
          page === "lobby" ? "h-100 max-h-100" : "h-60 max-h-60"
        }`}
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`chat ${msg.user === "You" ? "chat-end" : "chat-start"}`}
          >
            <div className="chat-header mb-1">
              <span
                className={`font-medium ${msg.user === "You" ? "text-primary" : "text-base-content"}`}
              >
                {msg.user}
              </span>
            </div>
            <div
              className={`chat-bubble ${msg.user === "You" ? "chat-bubble-primary" : "chat-bubble-base-300"}`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form
        onSubmit={sendMessage}
        className="message-input-form p-4 border-t border-base-300"
      >
        <div className="input-container flex gap-2">
          <input
            type="text"
            className="message-input input input-bordered flex-1 bg-base-100 text-base-content"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
          />
          <button className="send-btn btn btn-primary text-primary-content">
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

export default Chat;
