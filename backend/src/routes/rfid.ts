import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { requireAuth, requireRole, AuthRequest } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate";
import { rfidSchema, rfidAssignSchema } from "../validators";
import { AppError } from "../middlewares/errorHandler";
import { success } from "../utils/response";
import { sendPushToRole, sendPushNotification } from "../services/notification.service";

const router = Router();
const prisma = new PrismaClient();

const HOUR_MIN = 8;
const HOUR_MAX = 18;

router.get("/", requireAuth, requireRole("ADMIN", "RH", "MAGASINIER"), async (_req, res, next) => {
  try {
    const cards = await prisma.rfidCard.findMany({ include: { employee: true }, orderBy: { assignedAt: "desc" } });
    const mapped = cards.map(c => ({
      ...c, employeeName: c.employee ? `${c.employee.firstName} ${c.employee.lastName}` : null, employee: undefined,
    }));
    success(res, mapped);
  } catch (e) { next(e); }
});

router.post("/", requireAuth, requireRole("ADMIN"), validate(rfidSchema), async (req, res, next) => {
  try {
    const { uid } = req.body;
    if (!uid) throw new AppError("UID requis", 400);
    const card = await prisma.rfidCard.create({ data: { uid } });
    success(res, card, "Carte RFID créée");
  } catch (e) { next(e); }
});

router.post("/assign", requireAuth, requireRole("ADMIN"), validate(rfidAssignSchema), async (req, res, next) => {
  try {
    const { cardId, employeeId } = req.body;
    const card = await prisma.rfidCard.update({
      where: { id: cardId }, data: { employeeId, assignedAt: new Date() },
    });
    success(res, card, "Carte assignée");
  } catch (e) { next(e); }
});

router.put("/:id/toggle", requireAuth, requireRole("ADMIN"), async (req: AuthRequest, res, next) => {
  try {
    const card = await prisma.rfidCard.findUnique({ where: { id: String(req.params.id) } });
    if (!card) throw new AppError("Carte non trouvée", 404);
    const updated = await prisma.rfidCard.update({ where: { id: String(req.params.id) }, data: { isActive: !card.isActive } });
    success(res, updated, `Carte ${updated.isActive ? "activée" : "désactivée"}`);
  } catch (e) { next(e); }
});

router.post("/scan", async (req, res, next) => {
  try {
    const { uid, location } = req.body;
    const loc = location || "office";

    // 1) Unauthorized badge → red LED + alert RH + push
    const card = await prisma.rfidCard.findUnique({ where: { uid }, include: { employee: true } });
    if (!card || !card.isActive || !card.employeeId) {
      await prisma.alert.create({
        data: {
          type: "unauthorized_badge",
          severity: "critical",
          message: `Tentative de badge non autorisé: ${uid} à ${loc}`,
        },
      });
      await sendPushToRole("RH", "Badge non autorisé", `Tentative de badgeage refusée (${uid}) à ${loc}`);
      return res.status(403).json({
        success: false,
        message: "Badge non autorisé",
        led: "red",
        buffer: false,
      });
    }

    // 2) Block pointage outside authorized hours 8h-18h
    const now = new Date();
    const hour = now.getHours();
    if (hour < HOUR_MIN || hour >= HOUR_MAX) {
      await prisma.alert.create({
        data: {
          type: "out_of_hours_pointage",
          severity: "warning",
          message: `Pointage hors plage horaire 8h-18h par ${card.employee?.firstName} ${card.employee?.lastName} à ${now.toISOString()}`,
        },
      });
      await sendPushToRole("RH", "Pointage hors horaires", `Badgeage de ${card.employee?.firstName} refusé (hors 8h-18h)`);
      return res.status(403).json({
        success: false,
        message: "Pointage bloqué (hors plage 8h-18h)",
        led: "red",
        buffer: false,
      });
    }

    const today = new Date(); today.setHours(0, 0, 0, 0);
    const existing = await prisma.attendance.findFirst({
      where: { employeeId: card.employeeId, date: today, checkOut: null },
    });

    let result;
    let action: "in" | "out";
    if (existing) {
      const checkOut = new Date();
      const hoursWorked = (checkOut.getTime() - existing.checkIn.getTime()) / 3600000;
      result = await prisma.attendance.update({
        where: { id: existing.id },
        data: { checkOut, hoursWorked: Math.round(hoursWorked * 100) / 100 },
      });
      action = "out";
    } else {
      const status = hour > 8 ? "late" : "present";
      result = await prisma.attendance.create({
        data: { employeeId: card.employeeId!, checkIn: new Date(), date: today, location: loc, status, rfidCardId: card.id },
      });
      action = "in";
    }

    // 3) Push notification to employee confirming pointage
    const empName = `${card.employee?.firstName} ${card.employee?.lastName}`;
    const msg = action === "in"
      ? `Pointage entrée enregistré à ${now.toLocaleTimeString("fr-FR")} (${loc})`
      : `Pointage sortie enregistré. Heures travaillées: ${result.hoursWorked}h`;
    await sendPushNotification(card.employeeId, "Pointage confirmé", msg).catch(() => {});

    success(res, {
      ...result,
      led: "green",
      action,
      buffer: false,
    }, action === "out" ? "Sortie enregistrée" : "Entrée enregistrée");
  } catch (e) { next(e); }
});

export default router;


