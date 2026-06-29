import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { requireAuth, AuthRequest } from "../middlewares/auth.middleware";
import { requireRole } from "../middlewares/roles.middleware";
import { success } from "../utils/response";

const router = Router();
const prisma = new PrismaClient();

router.get("/stats", requireAuth, requireRole("ADMIN"), async (_req, res, next) => {
  try {
    const [users, employees, products, movements, certificates, payslips] = await Promise.all([
      prisma.user.count(),
      prisma.employee.count({ where: { isActive: true } }),
      prisma.product.count(),
      prisma.stockMovement.count(),
      prisma.certificateRequest.count(),
      prisma.paySlip.count(),
    ]);
    success(res, { users, employees, products, movements, certificates, payslips });
  } catch (e) { next(e); }
});

router.get("/logs", requireAuth, requireRole("ADMIN"), async (_req, res, next) => {
  try {
    const settings = await prisma.setting.findMany({ orderBy: { id: "desc" }, take: 100 });
    success(res, settings);
  } catch (e) { next(e); }
});

router.get("/users", requireAuth, requireRole("ADMIN"), async (_req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, email: true, name: true, role: true, isActive: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    });
    success(res, users);
  } catch (e) { next(e); }
});

export default router;
