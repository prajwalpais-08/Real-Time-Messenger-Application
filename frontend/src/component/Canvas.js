import React, { useEffect, useState, useRef } from "react";
import "./Canvas.css";
import Chatbot from "./Chatbot";

function Canvas({ socket }) {
  const canvasRef = useRef(null);
  const [showBot, setShowBot] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    // Set internal resolution to match display size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const ctx = canvas.getContext("2d");
    ctx.lineCap = "round";
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#000000";

    // Handle incoming drawing data
    if (socket) {
      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === "draw") {
          ctx.lineTo(data.x, data.y);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(data.x, data.y);
        }
      };
    }
  }, [socket]);

  return (
    <div className="canvas-area">
      <div className="board" style={{ width: '90%', height: '90%' }}>
        <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
        <button
          className="chat-icon"
          onClick={() => setShowBot(!showBot)}
        >
          🤖
        </button>
        {showBot && <Chatbot socket={socket} />}
      </div>
    </div>
  );
}

export default Canvas;