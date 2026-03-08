import React from "react";
import "./SideToolbar.css";

function SideToolbar({ setPenColor, setClearTrigger, setDownloadTrigger }) {
  
  const handleFutureFeature = () => {
    alert("Multiplayer Undo/Redo requires CRDT state synchronization. Scheduled for V2.0!");
  };

  return (
    <div className="sidebar">
      <button onClick={() => setPenColor("#ff0033")}>🎨</button>
      <button onClick={() => setPenColor("#39ff14")}>✏</button>
      <button onClick={() => setPenColor("ERASER")}>🧽</button>
      
      {/* 🔤 Text Tool: Puts the canvas in Text Mode */}
      <button onClick={() => setPenColor("TEXT")}>🔤</button>
      
      {/* 📥 Download: Triggers the canvas to save as a PNG */}
      <button onClick={() => setDownloadTrigger(prev => prev + 1)}>📥</button>
      
      <button onClick={handleFutureFeature}>↩</button>
      <button onClick={handleFutureFeature}>↪</button>
      
      <button onClick={() => setClearTrigger(prev => prev + 1)}>🗑</button>
    </div>
  );
}

export default SideToolbar;