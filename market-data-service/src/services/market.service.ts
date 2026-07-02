// services/market.service.ts

import prisma from "../config/db";
import { MarketPrice } from "@prisma/client";
import { publishOrderPriceUpdated } from "../messaging/publisher";

// Get latest price for a stock
export const getLatestPrice = (stockId: number): Promise<MarketPrice | null> =>
    prisma.marketPrice.findFirst({
        where: { stock_id: stockId },
        orderBy: { timestamp: "desc" },
    });

// Get price history for a stock
export const getPriceHistory = (stockId: number, limit: number = 100): Promise<MarketPrice[]> =>
    prisma.marketPrice.findMany({
        where: { stock_id: stockId },
        orderBy: { timestamp: "desc" },
        take: limit,
    });

// Record new price for a stock {Publisher will call this after order is executed}
export const recordPrice = async (stockId: number, price: number, symbol: string): Promise<MarketPrice> => {
    const marketPrice = await prisma.marketPrice.create({
        data: { stock_id: stockId, price, symbol: symbol },
    });
    await publishOrderPriceUpdated({ symbol: symbol, price: price }); // notify portfolio service of price update
    return marketPrice;
}