import React, { useState, useEffect, useRef } from 'react';

const Chat = ({ socket, username }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const scrollRef = useRef(null);

  useEffect(() => {
    if (!socket) return;

    const handleMessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        
        // IMPORTANT: Only add to the list if the message is a CHAT type
        // This prevents drawing data from cluttering your chat box
        if (data.type === "chat") {
          setMessages((prev) => [...prev, data]);
        }
      } catch (err) {
        console.error("Error parsing message:", err);
      }
    };

    socket.addEventListener("message", handleMessage);
    
    // Cleanup the listener when component unmounts
    return () => socket.removeEventListener("message", handleMessage);
  }, [socket]);

  // Auto-scroll to the bottom when a new message arrives
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();
    
    // Only send if there is text and the socket is connected
    if (input.trim() && socket && socket.readyState === WebSocket.OPEN) {
      const payload = { 
        type: "chat", 
        text: input, 
        sender: username 
      };

      // Send the data to the Go backend
      socket.send(JSON.stringify(payload));
      
      // Clear the input box
      setInput("");

      // NOTE: We do NOT call setMessages here anymore. 
      // The message will appear once the Go server broadcasts it back to us.
    }
  };

  return (
    /* ... inside Chat.js return ... */
<div className="chat-panel">
  <div className="chat-header">
    Group Chat
  </div>
  
  <div className="messages-list">
    {messages.map((m, i) => (
      <div key={i} className={`message-wrapper ${m.sender === username ? "self" : "other"}`}>
        <div className="message-bubble">
          <span className="message-sender">{m.sender}</span>
          <p className="message-text">{m.text}</p>
        </div>
      </div>
    ))}
    <div ref={scrollRef} />
  </div>

  <form onSubmit={sendMessage} className="chat-input-container">
    <input 
      value={input} 
      onChange={(e) => setInput(e.target.value)} 
      placeholder="Type a message..." 
    />
    <button type="submit">Send</button>
  </form>
</div>
  );
};

export default Chat;