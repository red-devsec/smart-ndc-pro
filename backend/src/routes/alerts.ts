import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { requireAuth, requireRole, AuthRequest } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate";
import { alertSchema } from "../validators";
import { success } from "../utils/response";

const router = Router();
const prisma = new PrismaClient();

router.get("/", requireAuth, async (_req, res, next) => {
  try {
    const alerts = await prisma.alert.findMany({ orderBy: { createdAt: "desc" } });
    success(res, alerts);
  } catch (e) { next(e); }
});

router.put("/:id/read", requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const alert = await prisma.alert.update({ where: { id: String(req.params.id) }, data: { isRead: true } });
    success(res, alert);
  } catch (e) { next(e); }
});

router.post("/", requireAuth, requireRole("ADMIN", "RH"), validate(alertSchema), async (req, res, next) => {
  try {
    const alert = await prisma.alert.create({ data: req.body });
    success(res, alert, "Alerte créée");
  } catch (e) { next(e); }
});

export default router;


