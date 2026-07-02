import { Router } from "express";
import { placeOrder, cancelOrder, getOrder, getOrders } from "../controllers/order.controller";
import { requireAuth } from '../middleware/auth.middleware';
import { asyncHandler } from '../middleware/async.middleware';
import { AuthRequest } from '../types/auth.types';

const router = Router();

// All routes require auth middleware (attach req.user before reaching here)
// POST /        - Place a new order (BUY or SELL)
// POST /:id/cancel - Cancel a pending order
// GET /:id      - Get a single order by id
// GET /         - Get order history (paginated)
router.post("/", requireAuth, asyncHandler<AuthRequest>(placeOrder));
router.post("/:id/cancel", requireAuth, asyncHandler<AuthRequest>(cancelOrder));
router.get("/:id", requireAuth, asyncHandler<AuthRequest>(getOrder));
router.get("/", requireAuth, asyncHandler<AuthRequest>(getOrders));

export default router;