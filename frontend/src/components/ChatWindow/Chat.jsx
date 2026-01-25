import { useState, useEffect, useRef } from "react";
import "./chat.css";
import socket from "../../socket";
const Chat = ({ roomId, user }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const messagesEndRef = useRef(null);

    const sendMessage = (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        setMessages((prev) => [...prev, { id: Date.now(), user: "You", text: newMessage }]);
        socket.emit("send-msg", { roomId, msg: newMessage, player: user.username });
        setNewMessage("");
    };

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    useEffect(() => {
        const updateChatMessage = ({ sender, message }) =>
            setMessages((prev) => [...prev, { id: Date.now(), user: sender, text: message }]);
        socket.on("broadcast-msg", updateChatMessage);
        return () => {
            socket.off("broadcast-msg", updateChatMessage);
        };
    }, []);

    return (
        <div className="card chat-card">
            <div className="card-header">Chat</div>
            <div className="messages-container">
                {messages.map((msg) => (
                    <div key={msg.id} className={`message ${msg.user === "You" ? "own-message" : ""}`}>
                        <div className="message-user">{msg.user}</div>
                        <div className="message-text">{msg.text}</div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>
            <form onSubmit={sendMessage} className="message-input-form">
                <div className="input-container">
                    <input
                        type="text"
                        className="message-input"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your message..."
                    />
                    <button className="send-btn">Send</button>
                </div>
            </form>
        </div>
    );
}

export default Chat;