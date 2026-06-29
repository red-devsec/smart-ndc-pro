import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { requireAuth, requireRole } from "../middlewares/auth.middleware";
import { success } from "../utils/response";
import { exportAttendanceExcel, exportInventoryPdf, exportMovementsExcel } from "../services/export.service";

const router = Router();
const prisma = new PrismaClient();

router.get("/hr/attendance", requireAuth, requireRole("ADMIN", "MANAGER", "RH"), async (req, res, next) => {
  try {
    const startDate = req.query.startDate ? String(req.query.startDate) : undefined;
    const endDate = req.query.endDate ? String(req.query.endDate) : undefined;
    const where: any = {};
    if (startDate && endDate) {
      where.date = { gte: new Date(startDate), lte: new Date(endDate) };
    }
    const data = await prisma.attendance.findMany({ where, include: { employee: true }, orderBy: { date: "desc" } });
    success(res, data);
  } catch (e) { next(e); }
});

router.get("/hr/leave-report", requireAuth, requireRole("ADMIN", "MANAGER", "RH"), async (req, res, next) => {
  try {
    const m = parseInt(String(req.query.month)) || new Date().getMonth();
    const y = parseInt(String(req.query.year)) || new Date().getFullYear();
    const start = new Date(y, m, 1);
    const end = new Date(y, m + 1, 0);
    const data = await prisma.leave.findMany({ where: { startDate: { gte: start }, endDate: { lte: end } }, include: { employee: true } });
    success(res, data);
  } catch (e) { next(e); }
});

router.get("/hr/attendance/export", requireAuth, requireRole("ADMIN", "MANAGER", "RH"), async (req, res, next) => {
  try {
    const startDate = req.query.startDate ? String(req.query.startDate) : undefined;
    const endDate = req.query.endDate ? String(req.query.endDate) : undefined;
    const where: any = {};
    if (startDate && endDate) where.date = { gte: new Date(startDate), lte: new Date(endDate) };
    const data = await prisma.attendance.findMany({ where, include: { employee: true }, orderBy: { date: "desc" } });
    const mapped = data.map((r) => ({
      employeeName: `${r.employee.firstName} ${r.employee.lastName}`,
      date: r.date.toLocaleDateString("fr-FR"),
      checkIn: r.checkIn.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
      checkOut: r.checkOut ? r.checkOut.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }) : "-",
      hoursWorked: r.hoursWorked || 0,
      status: r.status,
    }));
    const url = await exportAttendanceExcel(mapped);
    success(res, { url }, "Export généré");
  } catch (e) { next(e); }
});

router.get("/inventory/stock", requireAuth, requireRole("ADMIN", "MANAGER", "RH", "MAGASINIER"), async (_req, res, next) => {
  try {
    const data = await prisma.product.findMany({ include: { category: true } });
    success(res, data);
  } catch (e) { next(e); }
});

router.get("/inventory/export", requireAuth, requireRole("ADMIN", "MANAGER", "RH", "MAGASINIER"), async (_req, res, next) => {
  try {
    const data = await prisma.product.findMany({ include: { category: true } });
    const mapped = data.map((p) => ({
      name: p.name, barcode: p.barcode,
      category: (p as any).category?.name || "",
      quantity: p.quantity, price: p.price, location: p.location || "",
    }));
    const url = await exportInventoryPdf(mapped);
    success(res, { url }, "Export PDF généré");
  } catch (e) { next(e); }
});

router.get("/movements/export", requireAuth, requireRole("ADMIN", "MANAGER", "RH", "MAGASINIER"), async (req, res, next) => {
  try {
    const startDate = req.query.startDate ? String(req.query.startDate) : undefined;
    const endDate = req.query.endDate ? String(req.query.endDate) : undefined;
    const where: any = {};
    if (startDate && endDate) where.timestamp = { gte: new Date(startDate), lte: new Date(endDate) };
    const data = await prisma.stockMovement.findMany({ where, include: { product: true, employee: true }, orderBy: { timestamp: "desc" } });
    const mapped = data.map((m) => ({
      date: m.timestamp.toLocaleDateString("fr-FR"),
      employeeName: `${m.employee.firstName} ${m.employee.lastName}`,
      productName: m.product.name, type: m.type, reason: m.reason, quantity: m.quantity,
    }));
    const url = await exportMovementsExcel(mapped);
    success(res, { url }, "Export généré");
  } catch (e) { next(e); }
});

router.get("/combined/seller-ranking", requireAuth, requireRole("ADMIN", "MANAGER", "RH"), async (_req, res, next) => {
  try {
    const data = await prisma.stockMovement.groupBy({
      by: ["employeeId"], where: { type: "out", reason: "sale" },
      _count: { id: true }, _sum: { quantity: true },
    });
    success(res, data);
  } catch (e) { next(e); }
});

router.get("/combined/traceability", requireAuth, requireRole("ADMIN", "MANAGER", "RH", "MAGASINIER"), async (_req, res, next) => {
  try {
    const data = await prisma.stockMovement.findMany({
      include: { product: true, employee: true },
      orderBy: { timestamp: "desc" }, take: 100,
    });
    success(res, data);
  } catch (e) { next(e); }
});

router.get("/combined/anomalies", requireAuth, requireRole("ADMIN", "MANAGER", "RH"), async (_req, res, next) => {
  try {
    const movements = await prisma.stockMovement.findMany({
      include: { employee: true, product: true },
      orderBy: { timestamp: "desc" },
    });
    const anomalies = [];
    for (const m of movements) {
      const day = new Date(m.timestamp); day.setHours(0, 0, 0, 0);
      const att = await prisma.attendance.findFirst({ where: { employeeId: m.employeeId, date: day } });
      if (!att) anomalies.push(m);
    }
    success(res, anomalies);
  } catch (e) { next(e); }
});

export default router;


