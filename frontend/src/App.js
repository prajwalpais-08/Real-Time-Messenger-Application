import React, { useState, useEffect } from "react";
import TopBar from "./component/TopBar";
import SideToolbar from "./component/SideToolbar";
import Canvas from "./component/Canvas";
import Chat from "./component/Chat";
import AIChat from "./component/AIChat";
import "./App.css";

function App() {
  const [socket, setSocket] = useState(null);
  const [username, setUsername] = useState("");
  const [tempName, setTempName] = useState("");
  const [currentTool, setCurrentTool] = useState("pencil");
  const [selectedColor, setSelectedColor] = useState("#000000");
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8080/ws");
    setSocket(ws);
    return () => ws.close();
  }, []);

  const handleToolChange = (tool) => {
    setCurrentTool(tool);
    if (["undo", "redo", "delete"].includes(tool)) {
      setTimeout(() => setCurrentTool("pencil"), 100);
    }
  };

  if (!username) {
    return (
      <div className="join-container">
        <form onSubmit={(e) => { e.preventDefault(); if(tempName.trim()) setUsername(tempName); }} className="join-box">
          <h2>Join Whiteboard</h2>
          <input autoFocus value={tempName} onChange={(e) => setTempName(e.target.value)} placeholder="Enter name..." />
          <button type="submit">Join</button>
        </form>
      </div>
    );
  }

  return (
    <div className="app">
      <TopBar />
      <div className="workspace">
        <SideToolbar 
          currentTool={currentTool} 
          setTool={handleToolChange} 
          setColor={setSelectedColor}
          onAIToggle={() => setIsAIChatOpen(!isAIChatOpen)}
        />
        <div className="canvas-container-main">
          <Canvas socket={socket} tool={currentTool} color={selectedColor} />
          {isAIChatOpen && <AIChat onClose={() => setIsAIChatOpen(false)} />}
        </div>
        <Chat socket={socket} username={username} />
      </div>
    </div>
  );
}

export default App;