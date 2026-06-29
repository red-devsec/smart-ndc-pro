import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { requireAuth } from "../middlewares/auth.middleware";
import { success } from "../utils/response";
import { exportDashboardPdf } from "../services/export.service";

const router = Router();
const prisma = new PrismaClient();

router.get("/", requireAuth, async (_req, res, next) => {
  try {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const totalEmployees = await prisma.employee.count({ where: { isActive: true } });
    const presentToday = await prisma.attendance.count({
      where: { date: today, checkOut: null },
    });
    const pendingLeaves = await prisma.leave.count({ where: { status: "pending" } });
    const totalProducts = await prisma.product.count();
    const allProducts = await prisma.product.findMany();
    const lowStock = allProducts.filter(p => p.quantity <= p.minThreshold).length;
    const movementsToday = await prisma.stockMovement.count({
      where: { timestamp: { gte: today } },
    });

    success(res, {
      totalEmployees, presentToday,
      absentToday: totalEmployees - presentToday,
      pendingLeaves, totalProducts,
      stockAlerts: lowStock, lowStockProducts: lowStock,
      movementsToday,
    });
  } catch (e) { next(e); }
});

router.get("/export", requireAuth, async (_req, res, next) => {
  try {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const totalEmployees = await prisma.employee.count({ where: { isActive: true } });
    const presentToday = await prisma.attendance.count({ where: { date: today, checkOut: null } });
    const pendingLeaves = await prisma.leave.count({ where: { status: "pending" } });
    const totalProducts = await prisma.product.count();
    const allProducts = await prisma.product.findMany();
    const lowStock = allProducts.filter(p => p.quantity <= p.minThreshold).length;
    const movementsToday = await prisma.stockMovement.count({ where: { timestamp: { gte: today } } });

    const stats = [
      { label: "Total Employés", value: totalEmployees },
      { label: "Présents aujourd'hui", value: presentToday },
      { label: "Absents aujourd'hui", value: totalEmployees - presentToday },
      { label: "Congés en attente", value: pendingLeaves },
      { label: "Total Produits", value: totalProducts },
      { label: "Alertes stock", value: lowStock },
      { label: "Mouvements aujourd'hui", value: movementsToday },
    ];

    const url = await exportDashboardPdf(stats);
    success(res, { url }, "Export PDF généré");
  } catch (e) { next(e); }
});

export default router;


