import http from "http"

import app from "./app"
import { initializeSocket } from "./socket/socket"

const PORT = process.env.PORT || 3002

// Create HTTP server for Express + Socket.IO
const httpServer = http.createServer(app)

// Initialize Socket.IO
initializeSocket(httpServer);

// Start the server
httpServer.listen(PORT, () => {
  console.log(`[Server] Market data service running on port ${PORT}`)
})