import React, { useEffect, useRef, useState } from "react";

function Canvas({ socket, tool, color }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyStep, setHistoryStep] = useState(-1);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const resize = () => {
      const parent = canvas.parentElement;
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      if (historyStep >= 0) {
        const img = new Image();
        img.src = history[historyStep];
        img.onload = () => ctx.drawImage(img, 0, 0);
      }
    };

    window.addEventListener("resize", resize);
    resize();
    saveHistory();

    const handleMsg = (e) => {
      const data = JSON.parse(e.data);
      if (data.type === "draw") {
        ctx.strokeStyle = data.color;
        ctx.lineWidth = data.width;
        ctx.lineTo(data.x, data.y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(data.x, data.y);
      } else if (data.type === "clear") {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      } else if (data.type === "text") {
        ctx.font = "20px Arial";
        ctx.fillStyle = data.color;
        ctx.fillText(data.text, data.x, data.y);
      }
    };

    socket?.addEventListener("message", handleMsg);
    return () => {
      window.removeEventListener("resize", resize);
      socket?.removeEventListener("message", handleMsg);
    };
  }, [socket]);

  const saveHistory = () => {
    setHistory(prev => {
      const newHist = prev.slice(0, historyStep + 1);
      return [...newHist, canvasRef.current.toDataURL()];
    });
    setHistoryStep(prev => prev + 1);
  };

  useEffect(() => {
    if (tool === "undo" && historyStep > 0) {
      const step = historyStep - 1;
      const img = new Image();
      img.src = history[step];
      img.onload = () => {
        canvasRef.current.getContext("2d").clearRect(0,0,10000,10000);
        canvasRef.current.getContext("2d").drawImage(img, 0, 0);
        setHistoryStep(step);
      };
    }
    if (tool === "delete") {
      canvasRef.current.getContext("2d").clearRect(0,0,10000,10000);
      socket?.send(JSON.stringify({type: "clear"}));
      saveHistory();
    }
  }, [tool]);

  const draw = (e) => {
    if (!isDrawing || tool === "text") return;
    const ctx = canvasRef.current.getContext("2d");
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.strokeStyle = tool === "eraser" ? "#FFFFFF" : color;
    ctx.lineWidth = tool === "eraser" ? 30 : 5;
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);

    socket?.send(JSON.stringify({ type: "draw", x, y, color: ctx.strokeStyle, width: ctx.lineWidth }));
  };

  const handleMouseDown = (e) => {
    if (tool === "text") {
      const txt = prompt("Enter text:");
      if (txt) {
        const rect = canvasRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const ctx = canvasRef.current.getContext("2d");
        ctx.font = "20px Arial";
        ctx.fillStyle = color;
        ctx.fillText(txt, x, y);
        socket?.send(JSON.stringify({type: "text", x, y, text: txt, color}));
        saveHistory();
      }
    } else {
      setIsDrawing(true);
      draw(e);
    }
  };

 return (
  <div className="canvas-area">
    <div className="board">
      <canvas
        ref={canvasRef}
        className={`canvas-element ${
          tool === 'eraser' ? 'cursor-eraser' : 
          tool === 'text' ? 'cursor-text' : 
          'cursor-pencil'
        }`}
        onMouseDown={handleMouseDown}
        onMouseMove={draw}
        onMouseUp={() => { 
          setIsDrawing(false); 
          canvasRef.current.getContext("2d").beginPath(); 
          saveHistory(); 
        }}
        onMouseOut={() => { 
          if(isDrawing) saveHistory(); 
          setIsDrawing(false); 
        }}
      />
    </div>
  </div>
);
}
export default Canvas;