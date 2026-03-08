import React, { useEffect, useRef, useState } from 'react';

const Whiteboard = () => {
  const ws = useRef(null);
  const [shapes, setShapes] = useState([]);

  useEffect(() => {
    // 1. Connect to the Go backend
    ws.current = new WebSocket('ws://localhost:8080/ws');

    ws.current.onopen = () => {
      console.log('Connected to the Whiteboard Server!');
    };

    // 2. Listen for incoming drawings from other users (or late-joiner history)
    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('Received data from server:', data);
      
      // Frontend team logic: Update the canvas state with the incoming data here
      // setShapes((prev) => [...prev, data]); 
    };

    ws.current.onclose = () => {
      console.log('Disconnected from server');
    };

    // Cleanup connection when component unmounts
    return () => {
      if (ws.current) ws.current.close();
    };
  }, []);

  // Example function for the frontend team to call when the mouse is dragged
  const handleDraw = (x, y) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      const payload = {
        type: "DRAW_PREVIEW",
        x: x,
        y: y,
        color: "black" // Or whatever color is selected in the UI
      };
      ws.current.send(JSON.stringify(payload));
    }
  };

  return (
    <div>
      {/* Their Canvas UI goes here */}
    </div>
  );
};

export default Whiteboard;