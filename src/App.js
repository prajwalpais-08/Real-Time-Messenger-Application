import React, { useState } from "react";
import "./App.css";

import TopBar from "./component/TopBar";
import SideToolbar from "./component/SideToolbar";
import Canvas from "./component/Canvas";

function App() {
  const [penColor, setPenColor] = useState("#39ff14"); // Default green
  const [clearTrigger, setClearTrigger] = useState(0);
  const [downloadTrigger, setDownloadTrigger] = useState(0); // NEW!

  return (
    <div className="workspace">
      <TopBar />
      <div className="main-area">
        <SideToolbar 
          setPenColor={setPenColor} 
          setClearTrigger={setClearTrigger} 
          setDownloadTrigger={setDownloadTrigger} 
        />
        <Canvas 
          penColor={penColor} 
          clearTrigger={clearTrigger} 
          downloadTrigger={downloadTrigger} 
        />
      </div>
    </div>
  );
}

export default App;