import { Router } from "express";
const expressProxy = require("express-http-proxy");

import { services } from "../services/services";
import {
  authLimiter,
  marketLimiter,
  notificationLimiter,
  orderLimiter,
  portfolioLimiter,
  walletLimiter,
} from "../middleware/rate.limiter";

const router = Router();

const createProxy = (target: string) => expressProxy(target);

// Auth Service
router.use("/auth", authLimiter, createProxy(services.auth));

// Market Data Service
router.use("/market-data", marketLimiter, createProxy(services.marketData));

// Notification Service
router.use(
  "/notifications",
  notificationLimiter,
  createProxy(services.notification)
);

// Order Service
router.use("/orders", orderLimiter, createProxy(services.order));

// Portfolio Service
router.use("/portfolio", portfolioLimiter, createProxy(services.portfolio));

// Wallet Service
router.use("/wallet", walletLimiter, createProxy(services.wallet));

export default router;