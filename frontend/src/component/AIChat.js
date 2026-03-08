import React, { useState, useEffect, useRef } from 'react';

const AIChat = ({ onClose }) => {
  const [messages, setMessages] = useState([{ text: "Hello! I am your Whiteboard AI. How can I help you today?", isAI: true }]);
  const [input, setInput] = useState("");
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const askAI = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input;
    setMessages(prev => [...prev, { text: userMsg, isAI: false }]);
    setInput("");

    // Mock AI Response (Replace with actual API call)
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        text: `You asked about "${userMsg}". I'm currently in demo mode, but I can eventually help you generate diagrams or code!`, 
        isAI: true 
      }]);
    }, 1000);
  };

  return (
    <div className="ai-chat-window">
      <div className="ai-chat-header">
        <span>✨ AI Assistant</span>
        <button onClick={onClose}>✕</button>
      </div>
      <div className="ai-messages">
        {messages.map((m, i) => (
          <div key={i} className={`ai-msg ${m.isAI ? 'ai' : 'user'}`}>
            {m.text}
          </div>
        ))}
        <div ref={scrollRef} />
      </div>
      <form onSubmit={askAI} className="ai-input">
        <input 
          value={input} 
          onChange={(e) => setInput(e.target.value)} 
          placeholder="Ask AI anything..." 
        />
      </form>
    </div>
  );
};

export default AIChat;