import { Router, Request, Response } from "express"
import {
  startSimulator,
  stopSimulator,
  getStatus,
  updateSettings,
} from "../services/simulator.service";
import { verifyAdmin } from "../middleware/admin.middleware";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router()

// GET /simulator — get current status
router.get("/simulator", requireAuth, verifyAdmin, (_req: Request, res: Response) => {
  res.json(getStatus())
})

// POST /simulator/start — start simulator
router.post("/simulator/start",requireAuth, verifyAdmin, (_req: Request, res: Response) => {
  startSimulator()
  res.json({ message: "Simulator started", ...getStatus() })
})

// POST /simulator/stop — stop simulator
router.post("/simulator/stop",requireAuth,verifyAdmin, (_req: Request, res: Response) => {
  stopSimulator()
  res.json({ message: "Simulator stopped", ...getStatus() })
})

// PATCH /simulator/settings — update interval and max change without restart
// body: { intervalMs?: number, maxChangePercent?: number }
router.patch("/simulator/settings", requireAuth, verifyAdmin, (req: Request, res: Response) => {
  const { intervalMs, maxChangePercent } = req.body
  const updated = updateSettings({ intervalMs, maxChangePercent })
  res.json({ message: "Settings updated", ...updated })
})

export default router;