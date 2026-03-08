import React, { useEffect, useRef, useState } from "react";
import "./Canvas.css";

function Canvas({ socket }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Set canvas size based on its container
    canvas.width = canvas.parentElement.offsetWidth;
    canvas.height = canvas.parentElement.offsetHeight;

    ctx.lineCap = "round";
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#000000";

    if (!socket) return;

    const handleSocketMessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "draw") {
        ctx.lineTo(data.x, data.y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(data.x, data.y);
      }
    };

    socket.addEventListener("message", handleSocketMessage);
    return () => socket.removeEventListener("message", handleSocketMessage);
  }, [socket]);

  const startDrawing = (e) => {
    const { offsetX, offsetY } = e.nativeEvent;
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const ctx = canvasRef.current.getContext("2d");
    ctx.beginPath(); // Reset the path so lines don't connect across the screen
  };

  const draw = (e) => {
    if (!isDrawing || !socket) return;
    const { offsetX, offsetY } = e.nativeEvent;
    const ctx = canvasRef.current.getContext("2d");

    // 1. Draw locally
    ctx.lineTo(offsetX, offsetY);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(offsetX, offsetY);

    // 2. Send to Go Server
    socket.send(JSON.stringify({
      type: "draw",
      x: offsetX,
      y: offsetY
    }));
  };

  return (
    <div className="canvas-area">
      <div className="board" style={{ width: '100%', height: '100%', background: 'white' }}>
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseUp={stopDrawing}
          onMouseMove={draw}
          onMouseOut={stopDrawing}
          style={{ cursor: 'crosshair', display: 'block' }}
        />
      </div>
    </div>
  );
}

export default Canvas;