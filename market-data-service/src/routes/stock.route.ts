// routes/stock.routes.js
import { Router } from "express";
import * as stockController from "../controllers/stock.controller";
import { asyncHandler } from "../middleware/async.middleware";
import { verifyAdmin } from "../middleware/admin.middleware";
import { requireAuth } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate";
import {
  paginationSchema,
  createStockSchema,
  recordStockPriceSchemaBody,
  symbolParamSchema,
  idParamSchema,
  priceHistorySchemaQuery,
  updateStockSchemaBody,
} from "../validators/market.validator";

const router = Router();

// IMPORTANT: /search?symbol=<symbol> must be before /:symbol
// router.get("/search", asyncHandler(stockController.searchStocks));

//Get all Stocks
router.get(
  "/",
  validate(paginationSchema, "query"),
  asyncHandler(stockController.getAllStocks)
);

//Create new Stock [Admin only] - symbol, company_name, exchange
router.post(
  "/",
  requireAuth,
  verifyAdmin,
  validate(createStockSchema),
  asyncHandler(stockController.createStock)
); //Admin only
//Record new price for stock with given symbol [Admin only]
router.post(
  "/:symbol/price",
  requireAuth,
  verifyAdmin,
  validate(symbolParamSchema, "params"),
  validate(recordStockPriceSchemaBody),
  asyncHandler(stockController.recordStockPrice)
); //Admin only

//Get stock details by symbol, including latest price and price history
router.get(
  "/:symbol",
  validate(symbolParamSchema, "params"),
  asyncHandler(stockController.getStockBySymbol)
);
//Get latest price for stock with given symbol
router.get(
  "/:symbol/price",
  requireAuth,
  validate(symbolParamSchema, "params"),
  asyncHandler(stockController.getLatestPrice)
);
//Get price history for stock with given symbol, with optional query params for date range (start_date, end_date)
router.get(
  "/:symbol/history",
  requireAuth,
  validate(symbolParamSchema, "params"),
  validate(priceHistorySchemaQuery, "query"),
  asyncHandler(stockController.getPriceHistory)
);

//Update stock details by id [Admin only] - can update symbol, company_name, exchange
router.put(
  "/:id",
  requireAuth,
  verifyAdmin,
  validate(idParamSchema, "params"),
  validate(updateStockSchemaBody),
  asyncHandler(stockController.updateStock)
); //Admin only
//Delete stock by id [Admin only]
router.delete(
  "/:id",
  requireAuth,
  verifyAdmin,
  validate(idParamSchema, "params"),
  asyncHandler(stockController.deleteStock)
); //Admin only

export default router;

