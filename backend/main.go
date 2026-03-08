package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"sync"

	"github.com/gorilla/websocket"
	"Real-Time-Messenger-Application-/chatbot"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool { return true },
}

type Hub struct {
	clients   map[*websocket.Conn]bool
	broadcast chan []byte
	mutex     sync.Mutex
}

var hub = Hub{
	clients:   make(map[*websocket.Conn]bool),
	broadcast: make(chan []byte),
}

func handleConnections(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err)
		return
	}

	defer conn.Close()

	hub.mutex.Lock()
	hub.clients[conn] = true
	hub.mutex.Unlock()

	fmt.Println("User connected")

	for {
		_, msg, err := conn.ReadMessage()
		if err != nil {
			hub.mutex.Lock()
			delete(hub.clients, conn)
			hub.mutex.Unlock()
			fmt.Println("User disconnected")
			break
		}
		var request map[string]string
		err = json.Unmarshal(msg, &request)
		if err == nil && request["type"] == "bot" {
			apiKey := request["apiKey"]
			prompt := request["prompt"]
			reply, err := chatbot.AskGemini(prompt, apiKey)
			if err != nil {
				reply = "AI request failed."
			}
			response := map[string]string{
				"type": "bot",
				"text": reply,
			}
			jsonResponse, _ := json.Marshal(response)
			conn.WriteMessage(websocket.TextMessage, jsonResponse)
		} else {
			hub.broadcast <- msg
		}
	}
}

func handleMessages() {
	for {
		msg := <-hub.broadcast
		hub.mutex.Lock()
		for client := range hub.clients {
			err := client.WriteMessage(websocket.TextMessage, msg)
			if err != nil {
				client.Close()
				delete(hub.clients, client)
			}
		}
		hub.mutex.Unlock()
	}
}

func main() {
	http.HandleFunc("/ws", handleConnections)
	go handleMessages()
	fmt.Println("Server running on :8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}