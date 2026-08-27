import { Server } from "socket.io"
import type { Server as HttpServer } from "http"

import { MarketPriceUpdate } from "../types/socket.types"

// Socket.IO instance
let io: Server | undefined

// Initialize Socket.IO once when the HTTP server starts
export function initializeSocket(httpServer: HttpServer): Server {
  if (io) return io

  io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL ?? "http://localhost:8000",
      credentials: true,
    },
    path: "/socket.io",
    transports: ["polling", "websocket"],
  })

  console.log("[Socket] Socket.IO initialized")

  io.on("connection", (socket) => {
    console.log("[Socket] CLIENT CONNECTED:", socket.id)

    socket.on("disconnect", (reason) => {
      console.log("[Socket] CLIENT DISCONNECTED:", socket.id, reason)
    })
  })

  io.engine.on("connection_error", (error) => {
    console.error("[Socket]  CONNECTION ERROR:", {
      message: error.message,
      code: error.code,
      context: error.context,
    })
  })

  return io
}

// Get the initialized Socket.IO instance
export function getIO(): Server {
  if (!io) {
    throw new Error("[Socket] Not initialized — call initializeSocket first")
  }

  return io
}

// Broadcast market price updates to all clients
export function emitPriceUpdate(data: MarketPriceUpdate): void {
  getIO().emit("market:price:update", data)
}