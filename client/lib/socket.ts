import { io } from "socket.io-client"

// Socket.IO connects through the API gateway
// Connect directly to market-data service
export const socket = io("http://localhost:3002", {
  autoConnect: false,
  transports: ["polling", "websocket"],
})