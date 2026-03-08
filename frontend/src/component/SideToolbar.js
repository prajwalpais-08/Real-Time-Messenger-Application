import React from 'react';

const SideToolbar = ({ currentTool, setTool, setColor, onAIToggle }) => {
  return (
    <div className="side-toolbar">
      <button className={currentTool === 'pencil' ? 'active' : ''} onClick={() => setTool('pencil')}>✏️</button>
      <button className={currentTool === 'eraser' ? 'active' : ''} onClick={() => setTool('eraser')}>🧽</button>
      <button className={currentTool === 'text' ? 'active' : ''} onClick={() => setTool('text')}>🔤</button>
      <div className="divider" />
      <button className="ai-btn" onClick={onAIToggle}>🤖</button>
      <div className="divider" />
      <button onClick={() => setTool('undo')}>↩️</button>
      <button onClick={() => setTool('delete')} style={{color:'red'}}>🗑️</button>
      <div className="divider" />
      <input type="color" className="color-picker" onChange={(e) => { setTool('pencil'); setColor(e.target.value); }} />
    </div>
  );
};
export default SideToolbar;