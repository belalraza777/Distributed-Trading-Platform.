import { Router } from "express";
import prisma from "../config/db";
import { asyncHandler } from "../middleware/async.middleware";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

// GET /notifications
router.get(
  "/",
  requireAuth,
  asyncHandler(async (req, res) => {
    const userId = (req as any).user.id;

    const notifications = await prisma.notification.findMany({
      where: {
        user_id: userId,
      },
      orderBy: {
        created_at: "desc",
      },
    });

    res.status(200).json({
      success: true,
      data: notifications,
    });
  })
);

export default router;