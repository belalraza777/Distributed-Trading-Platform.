"use client"

import { useEffect } from "react"

import { socket } from "@/lib/socket"
import { useMarketStore } from "@/store/Market.store"
import { MarketPriceUpdate } from "@/types/Market.types"

export function useMarketSocket() {
  const updateLivePrice = useMarketStore(
    (state) => state.updateLivePrice
  )

  useEffect(() => {
    console.log("[Socket Client] Starting socket...")

    const handleConnect = () => {
      console.log(
        "[Socket Client] Connected:",
        socket.id
      )
    }

    const handleConnectError = (error: Error) => {
      console.error(
        "[Socket Client] Connection error:",
        error.message
      )
    }

    const handleDisconnect = (reason: string) => {
      console.log(
        "[Socket Client] Disconnected:",
        reason
      )
    }

    const handlePriceUpdate = (
      data: MarketPriceUpdate
    ) => {
      console.log(
        "[Socket Client] LIVE PRICE:",
        data
      )

      // Convert socket payload to StockPrice
      updateLivePrice({
        id: Date.now(),
        stock_id: data.stockId,
        symbol: data.symbol,
        price: data.price,
        timestamp: new Date(
          data.timestamp
        ).toISOString(),
      })
    }

    socket.on("connect", handleConnect)
    socket.on(
      "connect_error",
      handleConnectError
    )
    socket.on("disconnect", handleDisconnect)

    socket.on(
      "market:price:update",
      handlePriceUpdate
    )

    if (!socket.connected) {
      socket.connect()
    }

    // Remove only this component's listeners
    return () => {
      socket.off("connect", handleConnect)
      socket.off(
        "connect_error",
        handleConnectError
      )
      socket.off(
        "disconnect",
        handleDisconnect
      )
      socket.off(
        "market:price:update",
        handlePriceUpdate
      )
    }
  }, [updateLivePrice])
}