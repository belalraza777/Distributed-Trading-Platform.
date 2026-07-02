// controllers/stock.controller.ts

import { Request, Response } from "express";
import * as stockService from "../services/stock.service";
import * as marketService from "../services/market.service";

//Get all stocks
export const getAllStocks = async (req: Request, res: Response): Promise<void> => {
  const stocks = await stockService.getAllStocks();
  res.json({ success: true, data: stocks });
};

//Search stocks by query
export const searchStocks = async (req: Request, res: Response): Promise<void> => {
  const stocks = await stockService.searchStocks(req.query.q as string);
  res.json({ success: true, data: stocks });
};

//Get stock by symbol
export const getStockBySymbol = async (req: Request, res: Response): Promise<void> => {
  const stock = await stockService.getStockBySymbol(req.params.symbol);
  if (!stock) {
    res.status(404).json({ success: false, message: "Stock not found" });
    return;
  }
  res.json({ success: true, data: stock });
};

// Record stock price [admin only]
export const recordStockPrice = async (req: Request, res: Response): Promise<void> => {
  const stock = await stockService.getStockBySymbol(req.params.symbol);
  if (!stock) {
    res.status(404).json({ success: false, message: "Stock not found" });
    return;
  }

  const { price } = req.body;
  const marketPrice = await marketService.recordPrice(stock.id, Number(price), stock.symbol);

  res.status(201).json({
    success: true,
    data: {
      symbol: stock.symbol,
      price: parseFloat(marketPrice.price.toString()),
      timestamp: marketPrice.timestamp,
    },
  });
};

//Get latest price for stock
export const getLatestPrice = async (req: Request, res: Response): Promise<void> => {
  const stock = await stockService.getStockBySymbol(req.params.symbol);
  if (!stock) {
    res.status(404).json({ success: false, message: "Stock not found" });
    return;
  }

  const latest = await marketService.getLatestPrice(stock.id);
  if (!latest) {
    res.status(404).json({ success: false, message: "No price data found" });
    return;
  }

  res.json({
    success: true,
    data: {
      symbol: stock.symbol,
      price: parseFloat(latest.price.toString()),
      timestamp: latest.timestamp,
    },
  });
};

//Get price history for stock
export const getPriceHistory = async (req: Request, res: Response): Promise<void> => {
  const stock = await stockService.getStockBySymbol(req.params.symbol);
  if (!stock) {
    res.status(404).json({ success: false, message: "Stock not found" });
    return;
  }

  const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
  const history = await marketService.getPriceHistory(stock.id, limit);

  res.json({
    success: true,
    data: history.map((e) => ({
      price: parseFloat(e.price.toString()),
      timestamp: e.timestamp,
    })),
  });
};

//Create new stock [admin only]
export const createStock = async (req: Request, res: Response): Promise<void> => {
  const stock = await stockService.createStock(req.body);
  res.status(201).json({ success: true, data: stock });
};

//Update stock [admin only]
export const updateStock = async (req: Request, res: Response): Promise<void> => {
  const stock = await stockService.updateStock(parseInt(req.params.id), req.body);
  res.json({ success: true, data: stock });
};

//Delete stock [admin only]
export const deleteStock = async (req: Request, res: Response): Promise<void> => {
  await stockService.deleteStock(parseInt(req.params.id));
  res.json({ success: true, message: "Stock deleted" });
};
