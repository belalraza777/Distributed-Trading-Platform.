import { Router } from "express";
import {
  getNotifications,
  markAllAsRead,
  markAsRead,
} from "../controllers/notification.controller";
import { requireAuth } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate";
import {
  idParamSchema,
  paginationSchema,
} from "../validators/notification.validator";

const router = Router();

router.get(
  "/",
  requireAuth,
  validate(paginationSchema, "query"),
  getNotifications
);
router.patch("/:id/read", requireAuth, validate(idParamSchema, "params"), markAsRead);
router.patch("/read-all", requireAuth, markAllAsRead);

export default router;