// routes/stock.routes.js
import { Router } from "express";
import * as stockController from "../controllers/stock.controller";
import { asyncHandler } from "../middleware/async.middleware";

const router = Router();

// IMPORTANT: /search?symbol=<symbol> must be before /:symbol 
// router.get("/search", asyncHandler(stockController.searchStocks));

//Get all Stocks
router.get("/", asyncHandler(stockController.getAllStocks));

//Create new Stock [Admin only] - symbol, company_name, exchange
router.post("/", asyncHandler(stockController.createStock)); //Admin only
//Record new price for stock with given symbol [Admin only]
router.post("/:symbol/price", asyncHandler(stockController.recordStockPrice)); //Admin only

//Get stock details by symbol, including latest price and price history
router.get("/:symbol", asyncHandler(stockController.getStockBySymbol));
//Get latest price for stock with given symbol
router.get("/:symbol/price", asyncHandler(stockController.getLatestPrice));
//Get price history for stock with given symbol, with optional query params for date range (start_date, end_date)
router.get("/:symbol/history", asyncHandler(stockController.getPriceHistory));

//Update stock details by id [Admin only] - can update symbol, company_name, exchange
router.put("/:id", asyncHandler(stockController.updateStock)); //Admin only
//Delete stock by id [Admin only]
router.delete("/:id", asyncHandler(stockController.deleteStock)); //Admin only

export default router;
