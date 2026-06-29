import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { requireAuth, requireRole, AuthRequest } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate";
import { checkinSchema } from "../validators";
import { AppError } from "../middlewares/errorHandler";
import { success } from "../utils/response";

const router = Router();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "smartndc-jwt-secret-2026";

router.get("/", requireAuth, requireRole("ADMIN", "RH"), async (req, res, next) => {
  try {
    const date = req.query.date ? String(req.query.date) : undefined;
    const employeeId = req.query.employeeId ? String(req.query.employeeId) : undefined;
    const where: any = {};
    if (date) where.date = new Date(date);
    if (employeeId) where.employeeId = employeeId;

    const records = await prisma.attendance.findMany({
      where, include: { employee: true },
      orderBy: { date: "desc" },
    });
    const mapped = records.map(r => ({
      ...r, employeeName: `${r.employee.firstName} ${r.employee.lastName}`,
      employee: undefined,
    }));
    success(res, mapped);
  } catch (e) { next(e); }
});

router.get("/today", requireAuth, requireRole("ADMIN", "RH"), async (_req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const records = await prisma.attendance.findMany({
      where: { date: today },
      include: { employee: true },
    });
    const mapped = records.map(r => ({
      ...r, employeeName: `${r.employee.firstName} ${r.employee.lastName}`,
      employee: undefined,
    }));
    success(res, mapped);
  } catch (e) { next(e); }
});

router.get("/employee/:id", requireAuth, requireRole("ADMIN", "RH"), async (req, res, next) => {
  try {
    const records = await prisma.attendance.findMany({
      where: { employeeId: String(req.params.id) },
      include: { employee: true },
      orderBy: { date: "desc" },
    });
    success(res, records);
  } catch (e) { next(e); }
});

router.post("/checkin", requireAuth, validate(checkinSchema), async (req: AuthRequest, res, next) => {
  try {
    const { rfidUid, location } = req.body;
    let employeeId = req.user!.id;

    if (rfidUid) {
      const card = await prisma.rfidCard.findUnique({ where: { uid: rfidUid } });
      if (!card || !card.isActive) throw new AppError("Carte RFID invalide ou désactivée", 403);
      if (!card.employeeId) throw new AppError("Carte non assignée", 400);
      employeeId = card.employeeId;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const existing = await prisma.attendance.findFirst({
      where: { employeeId, date: today, checkOut: null },
    });
    if (existing) throw new AppError("Pointage déjà effectué", 400);

    const hour = new Date().getHours();
    const status = hour > 8 ? "late" : "present";

    const record = await prisma.attendance.create({
      data: { employeeId, checkIn: new Date(), date: today, location: location || "office", status },
    });

    const io = req.app.get("io");
    io?.emit("attendance:update", record);

    success(res, record, "Pointage enregistré");
  } catch (e) { next(e); }
});

router.post("/checkout/:id", requireAuth, async (req, res, next) => {
  try {
    const record = await prisma.attendance.findUnique({ where: { id: String(req.params.id) } });
    if (!record) throw new AppError("Pointage non trouvé", 404);
    if (record.checkOut) throw new AppError("Déjà pointé sortie", 400);

    const checkOut = new Date();
    const hoursWorked = (checkOut.getTime() - record.checkIn.getTime()) / 3600000;

    const updated = await prisma.attendance.update({
      where: { id: String(req.params.id) },
      data: { checkOut, hoursWorked: Math.round(hoursWorked * 100) / 100 },
    });

    const io = req.app.get("io");
    io?.emit("attendance:update", updated);

    success(res, updated, "Sortie enregistrée");
  } catch (e) { next(e); }
});

export default router;


