This project is under development and is not yet ready for use.
Please check back later for updates.

1. GameRoom sockets : 
   - oppponent status
   - player status
   - gameEnd
   - codeResult

Should Admin have endGame button ? Yes
Should it be time bound match? No. But we will make it a option.

Check each component render activation. Put console statement in component code.

              <div className="chat-panel">
                {/* Chat Header */}
                <div className="chat-header">
                  <h3>Chat Room</h3>
                  <div className="room-info">
                    <span className="room-name">{roomName || "Room #" + roomId}</span>
                    <span className="players-count">{players.length}/{maxPlayers} Players</span>
                  </div>
                </div>

                {/* Messages Container */}
                <div className="messages-container">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`message ${msg.user === "You" ? "own-message" : ""}`}
                    >
                      <div className="message-header">
                        <span className="message-user">{msg.user}</span>
                        <span className="message-time">{msg.time}</span>
                      </div>
                      <div className="message-text">{msg.text}</div>
                    </div>
                  ))}
                </div>

                {/* Message Input */}
                <div className="message-input-container">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    rows={2}
                    className="message-input"
                  />
                  <button
                    onClick={sendMessage}
                    className="send-button"
                    disabled={!newMessage.trim()}
                  >
                    Send
                  </button>
                </div>
              </div>