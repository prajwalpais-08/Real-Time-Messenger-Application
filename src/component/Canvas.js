import React, { useRef, useEffect, useState } from "react";
import "./Canvas.css";

function Canvas({ penColor, clearTrigger, downloadTrigger }) {
  const canvasRef = useRef(null);
  const wrapperRef = useRef(null);
  const contextRef = useRef(null);
  const ws = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrapper = wrapperRef.current;
    
    canvas.width = wrapper.clientWidth * 2;
    canvas.height = wrapper.clientHeight * 2;
    canvas.style.width = `${wrapper.clientWidth}px`;
    canvas.style.height = `${wrapper.clientHeight}px`;

    const context = canvas.getContext("2d");
    context.scale(2, 2); 
    context.lineCap = "round";
    context.strokeStyle = "#39ff14"; 
    context.lineWidth = 5;
    contextRef.current = context;

    const socket = new WebSocket("ws://localhost:8080/ws");
    ws.current = socket;

    socket.onopen = () => console.log("✅ Connected to the Go Whiteboard Hub!");

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const ctx = contextRef.current;

      if (data.type === "DRAW_PREVIEW") {
        ctx.save();
        if (data.color === "ERASER") {
          ctx.globalCompositeOperation = "destination-out";
          ctx.lineWidth = 20;
        } else {
          ctx.globalCompositeOperation = "source-over";
          ctx.strokeStyle = data.color;
          ctx.lineWidth = 5;
        }
        ctx.lineTo(data.x, data.y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(data.x, data.y);
        ctx.restore();

      } else if (data.type === "DRAW_COMPLETE") {
        ctx.beginPath();
      } else if (data.type === "CLEAR_BOARD") {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // NEW: Handle incoming text from other users!
      } else if (data.type === "DRAW_TEXT") {
        ctx.save();
        ctx.font = "24px Arial";
        ctx.fillStyle = data.color;
        ctx.fillText(data.text, data.x, data.y);
        ctx.restore();
      }
    };

    return () => {
      if (socket.readyState === 1) socket.close();
    };
  }, []);

  // Watch for Color/Eraser/Text tool changes
  useEffect(() => {
    if (contextRef.current) {
      if (penColor === "ERASER") {
        contextRef.current.globalCompositeOperation = "destination-out"; 
        contextRef.current.lineWidth = 20; 
      } else if (penColor !== "TEXT") {
        contextRef.current.globalCompositeOperation = "source-over"; 
        contextRef.current.strokeStyle = penColor;
        contextRef.current.lineWidth = 5;
      }
    }
  }, [penColor]);

  // Watch for the Trash Can click
  useEffect(() => {
    if (clearTrigger > 0 && canvasRef.current) {
      const canvas = canvasRef.current;
      contextRef.current.clearRect(0, 0, canvas.width, canvas.height);
      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        ws.current.send(JSON.stringify({ type: "CLEAR_BOARD" }));
      }
    }
  }, [clearTrigger]);

  // NEW: Watch for the Download click
  useEffect(() => {
    if (downloadTrigger > 0 && canvasRef.current) {
      const canvas = canvasRef.current;
      const link = document.createElement("a");
      link.download = "our_whiteboard.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    }
  }, [downloadTrigger]);

  const startDrawing = ({ nativeEvent }) => {
    const { offsetX, offsetY } = nativeEvent;

    // NEW: If we are in Text mode, prompt for text instead of drawing a line!
    if (penColor === "TEXT") {
      const textToDraw = prompt("Enter text to place on the board:");
      if (textToDraw) {
        contextRef.current.font = "24px Arial";
        contextRef.current.fillStyle = "#39ff14"; // Default green text
        contextRef.current.fillText(textToDraw, offsetX, offsetY);
        
        // Broadcast the text to the Go server
        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
          ws.current.send(JSON.stringify({
            type: "DRAW_TEXT",
            text: textToDraw,
            x: offsetX,
            y: offsetY,
            color: "#39ff14"
          }));
        }
      }
      return; // Stop here so it doesn't draw a line
    }

    contextRef.current.beginPath();
    contextRef.current.moveTo(offsetX, offsetY);
    setIsDrawing(true);
  };

  const finishDrawing = () => {
    if (!isDrawing) return;
    contextRef.current.closePath();
    setIsDrawing(false);
    
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ type: "DRAW_COMPLETE" }));
    }
  };

  const draw = ({ nativeEvent }) => {
    // If we aren't drawing, or if we are in TEXT mode, don't draw lines!
    if (!isDrawing || penColor === "TEXT") return;
    
    const { offsetX, offsetY } = nativeEvent;
    
    contextRef.current.lineTo(offsetX, offsetY);
    contextRef.current.stroke();

    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ 
        type: "DRAW_PREVIEW", 
        x: offsetX, 
        y: offsetY, 
        color: penColor 
      }));
    }
  };

  return (
    <div className="canvas-area" ref={wrapperRef} style={{ flexGrow: 1, height: "100%", overflow: "hidden" }}>
      <canvas
        onMouseDown={startDrawing}
        onMouseUp={finishDrawing}
        onMouseOut={finishDrawing}
        onMouseMove={draw}
        ref={canvasRef}
        style={{ cursor: penColor === "TEXT" ? "text" : "crosshair" }} 
      />
    </div>
  );
}

export default Canvas;