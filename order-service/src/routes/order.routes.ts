import { Router } from "express";
import {
  placeOrder,
  cancelOrder,
  getOrder,
  getOrders,
} from "../controllers/order.controller";
import { requireAuth } from "../middleware/auth.middleware";
import { asyncHandler } from "../middleware/async.middleware";
import { AuthRequest } from "../types/auth.types";
import { validate } from "../middleware/validate";
import {
  placeOrderSchema,
  idParamSchema,
  paginationSchema,
} from "../validators/order.validator";

const router = Router();

// All routes require auth middleware (attach req.user before reaching here)
// POST /        - Place a new order (BUY or SELL)
// POST /:id/cancel - Cancel a pending order
// GET /:id      - Get a single order by id
// GET /         - Get order history (paginated)
router.post(
  "/",
  requireAuth,
  validate(placeOrderSchema),
  asyncHandler<AuthRequest>(placeOrder)
);
router.post(
  "/:id/cancel",
  requireAuth,
  validate(idParamSchema, "params"),
  asyncHandler<AuthRequest>(cancelOrder)
);
router.get(
  "/:id",
  requireAuth,
  validate(idParamSchema, "params"),
  asyncHandler<AuthRequest>(getOrder)
);
router.get(
  "/",
  requireAuth,
  validate(paginationSchema, "query"),
  asyncHandler<AuthRequest>(getOrders)
);

export default router;