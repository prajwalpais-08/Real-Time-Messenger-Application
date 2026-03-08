import React from "react";
import "./TopBar.css";

function TopBar(){
  return(
    <div className="topbar">
      <h2>Realtime Whiteboard</h2>

      <div className="controls">
        <button>◀</button>
        <button>▶</button>
        <button>Board</button>
      </div>
    </div>
  );
}

export default TopBar;
