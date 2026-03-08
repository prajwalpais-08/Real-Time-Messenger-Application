import React, { useState, useEffect } from "react";
import TopBar from "./component/TopBar";
import SideToolbar from "./component/SideToolbar";
import Canvas from "./component/Canvas";
import Chat from "./component/Chat";
import "./App.css";

function App() {
  const [socket, setSocket] = useState(null);
  const [username, setUsername] = useState("");
  const [tempName, setTempName] = useState("");

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8080/ws");
    setSocket(ws);
    return () => ws.close();
  }, []);

  const handleJoin = (e) => {
    e.preventDefault();
    if (tempName.trim()) setUsername(tempName);
  };

  if (!username) {
    return (
      <div className="join-container">
        <form onSubmit={handleJoin} className="join-box">
          <h2>Join Whiteboard</h2>
          <input
            autoFocus
            placeholder="Enter your name..."
            value={tempName}
            onChange={(e) => setTempName(e.target.value)}
          />
          <button type="submit">Join</button>
        </form>
      </div>
    );
  }

  return (
    <div className="app">
      <TopBar />
      <div className="workspace">
        <SideToolbar />
        <Canvas socket={socket} username={username} />
        <Chat socket={socket} username={username} />
      </div>
    </div>
  );
}

export default App;