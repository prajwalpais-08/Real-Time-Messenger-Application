import React, { useState, useEffect } from "react";

function Chatbot({ socket }) {
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState([]);
    const [apiKey, setApiKey] = useState("");

    useEffect(() => {
        const handleMessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.type === "bot") {
                    setMessages(prev => [
                        ...prev,
                        { sender: "bot", text: data.text }
                    ]);

                }
            } catch {
                setMessages(prev => [
                    ...prev,
                    { sender: "bot", text: event.data }
                ]);
            }
        };
        socket.addEventListener("message", handleMessage);

        return () => {
            socket.removeEventListener("message", handleMessage);
        };
    }, [socket]);

    const sendMessage = () => {
        if (!input.trim()) return;
        if (socket.readyState !== WebSocket.OPEN) {
            console.log("WebSocket not connected");
            return;
        }
        socket.send(JSON.stringify({
            type: "bot",
            apiKey: apiKey,
            prompt: input.trim()
        }));
        setMessages(prev => [
            ...prev,
            { sender: "user", text: input }
        ]);
        setInput("");
    };

    return (
        <div style={styles.chatbot}>
            <h3>AI Assistant</h3>
            <input
                type="password"
                placeholder="Enter your Gemini API key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                style={{ width: "100%", marginBottom: "10px" }}
            />

            <div style={styles.messages}>
                {messages.map((msg, index) => (
                    <div
                        key={index}
                        style={{
                            textAlign: msg.sender === "user" ? "right" : "left",
                            margin: "5px"
                        }}
                    >
                        <span
                            style={{
                                background: msg.sender === "user" ? "#4CAF50" : "#eee",
                                color: msg.sender === "user" ? "white" : "black",
                                padding: "6px 10px",
                                borderRadius: "10px",
                                display: "inline-block"
                            }}
                        >
                            {msg.text}
                        </span>
                    </div>
                ))}
            </div>

            <input
                type="text"
                value={input}
                placeholder="Ask something..."
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === "Enter") sendMessage();
                }}
                style={{ width: "75%" }}
            />

            <button onClick={sendMessage}>Send</button>
        </div>
    );
}

const styles = {
    chatbot: {
        position: "fixed",
        bottom: "80px",
        right: "20px",
        width: "320px",
        background: "#ffffff",
        border: "1px solid #ccc",
        padding: "12px",
        borderRadius: "10px",
        boxShadow: "0 0 10px rgba(0,0,0,0.2)"
    },

    messages: {
        height: "220px",
        overflowY: "auto",
        marginBottom: "10px",
        fontSize: "14px"
    }
};

export default Chatbot;