package main

import (
	"encoding/json"
	"log"
	"net/http"
	"sync"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool { return true },
}

type Hub struct {
	clients    map[*websocket.Conn]bool
	broadcast  chan []byte
	register   chan *websocket.Conn
	unregister chan *websocket.Conn
	mu         sync.Mutex
	history    [][]byte // NEW: Array to store completed shapes
}

func newHub() *Hub {
	return &Hub{
		broadcast:  make(chan []byte),
		register:   make(chan *websocket.Conn),
		unregister: make(chan *websocket.Conn),
		clients:    make(map[*websocket.Conn]bool),
		history:    make([][]byte, 0), // Initialize the history array
	}
}

func (h *Hub) run() {
	for {
		select {
		case client := <-h.register:
			h.mu.Lock()
			h.clients[client] = true

			// NEW: When someone joins, send them all the previously drawn shapes
			for _, msg := range h.history {
				client.WriteMessage(websocket.TextMessage, msg)
			}
			h.mu.Unlock()
			log.Println("New user joined the whiteboard!")

		case client := <-h.unregister:
			h.mu.Lock()
			if _, ok := h.clients[client]; ok {
				delete(h.clients, client)
				client.Close()
				log.Println("User left the whiteboard.")
			}
			h.mu.Unlock()

		case message := <-h.broadcast:
			h.mu.Lock()

			// NEW: Check if the message is a completed shape. If yes, save it!
			var msgData map[string]interface{}
			if err := json.Unmarshal(message, &msgData); err == nil {
				if msgData["type"] == "DRAW_COMPLETE" {
					h.history = append(h.history, message)
				}
			}

			// Broadcast to everyone currently connected
			for client := range h.clients {
				err := client.WriteMessage(websocket.TextMessage, message)
				if err != nil {
					log.Printf("Error: %v", err)
					client.Close()
					delete(h.clients, client)
				}
			}
			h.mu.Unlock()
		}
	}
}

func handleConnections(h *Hub, w http.ResponseWriter, r *http.Request) {
	ws, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("Upgrade error:", err)
		return
	}
	h.register <- ws
	for {
		_, msg, err := ws.ReadMessage()
		if err != nil {
			h.unregister <- ws
			break
		}
		h.broadcast <- msg
	}
}

func main() {
	hub := newHub()
	go hub.run()
	http.HandleFunc("/ws", func(w http.ResponseWriter, r *http.Request) {
		handleConnections(hub, w, r)
	})
	log.Println("Whiteboard backend running on :8080")
	err := http.ListenAndServe(":8080", nil)
	if err != nil {
		log.Fatal("ListenAndServe: ", err)
	}
}