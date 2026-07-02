// services/stock.service.ts

import prisma from "../config/db";
import { Stock } from "@prisma/client";

// Input types for creating/updating stocks
export interface CreateStockInput {
  symbol: string;
  company_name: string;
  exchange: string;
}

export interface UpdateStockInput {
  symbol?: string;
  company_name?: string;
  exchange?: string;
}

// Get all stocks
export const getAllStocks = (): Promise<Stock[]> =>
  prisma.stock.findMany({ orderBy: { symbol: "asc" } });

// Get stock by symbol
export const getStockBySymbol = (symbol: string): Promise<Stock | null> =>
  prisma.stock.findUnique({ where: { symbol: symbol.toUpperCase() } });

// Get stock by ID
export const getStockById = (id: number): Promise<Stock | null> =>
  prisma.stock.findUnique({ where: { id } });

// Search stocks by symbol or company name
export const searchStocks = (query: string): Promise<Stock[]> =>
  prisma.stock.findMany({
    where: {
      OR: [
        { symbol: { contains: query, mode: "insensitive" } },
        { company_name: { contains: query, mode: "insensitive" } },
      ],
    },
  });

// Create new stock
export const createStock = (data: CreateStockInput): Promise<Stock> =>
  prisma.stock.create({
    data: {
      symbol: data.symbol.toUpperCase(),
      company_name: data.company_name,
      exchange: data.exchange,
    },
  });

  // Update existing stock
export const updateStock = (id: number, data: UpdateStockInput): Promise<Stock> =>
  prisma.stock.update({ where: { id }, data });

// Delete stock
export const deleteStock = (id: number): Promise<Stock> =>
  prisma.stock.delete({ where: { id } });