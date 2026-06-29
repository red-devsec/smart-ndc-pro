import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { requireAuth, requireRole, AuthRequest } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate";
import { leaveSchema, leaveStatusSchema } from "../validators";
import { AppError } from "../middlewares/errorHandler";
import { success } from "../utils/response";

const router = Router();
const prisma = new PrismaClient();

router.get("/", requireAuth, requireRole("ADMIN", "MANAGER", "RH"), async (req, res, next) => {
  try {
    const status = req.query.status ? String(req.query.status) : undefined;
    const employeeId = req.query.employeeId ? String(req.query.employeeId) : undefined;
    const where: any = {};
    if (status) where.status = status;
    if (employeeId) where.employeeId = employeeId;

    const leaves = await prisma.leave.findMany({
      where, include: { employee: true },
      orderBy: { createdAt: "desc" },
    });
    const mapped = leaves.map(l => ({
      ...l, employeeName: `${l.employee.firstName} ${l.employee.lastName}`,
      employee: undefined,
    }));
    success(res, mapped);
  } catch (e) { next(e); }
});

router.get("/balance", requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const employee = await prisma.employee.findUnique({ where: { email: req.user!.email } });
    if (!employee) throw new AppError("Employé non trouvé", 404);
    success(res, {
      balance: employee.leaveBalance,
      taken: employee.leaveTaken,
      remaining: employee.leaveBalance - employee.leaveTaken,
    });
  } catch (e) { next(e); }
});

router.post("/", requireAuth, validate(leaveSchema), async (req: AuthRequest, res, next) => {
  try {
    const { type, startDate, endDate, reason, documentUrl } = req.body;
    const employee = await prisma.employee.findUnique({ where: { email: req.user!.email } });
    if (!employee) throw new AppError("Employé non trouvé", 404);

    const daysRequested = Math.ceil(
      (new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)
    ) + 1;
    const available = employee.leaveBalance - employee.leaveTaken;
    if (daysRequested > available) {
      throw new AppError(
        `Solde insuffisant. Requis: ${daysRequested}j, Disponible: ${available}j`, 400
      );
    }

    const leave = await prisma.leave.create({
      data: {
        employeeId: employee.id, type, reason, documentUrl,
        startDate: new Date(startDate), endDate: new Date(endDate),
      },
    });

    await prisma.alert.create({
      data: { type: "leave_pending", message: `Demande de congé: ${employee.firstName} ${employee.lastName}`, severity: "info" },
    });

    success(res, leave, "Demande de congé envoyée");
  } catch (e) { next(e); }
});

router.put("/:id/status", requireAuth, requireRole("ADMIN", "RH"), validate(leaveStatusSchema), async (req: AuthRequest, res, next) => {
  try {
    const { status } = req.body;
    if (!["approved", "rejected"].includes(status)) throw new AppError("Statut invalide", 400);

    const leave = await prisma.leave.findUnique({
      where: { id: String(req.params.id) },
      include: { employee: true },
    });
    if (!leave) throw new AppError("Congé non trouvé", 404);

    if (status === "approved" && leave.status !== "approved") {
      const days = Math.ceil(
        (new Date(leave.endDate).getTime() - new Date(leave.startDate).getTime()) / (1000 * 60 * 60 * 24)
      ) + 1;
      await prisma.employee.update({
        where: { id: leave.employeeId },
        data: { leaveTaken: { increment: days } },
      });
    }

    const updated = await prisma.leave.update({
      where: { id: String(req.params.id) },
      data: { status, reviewedBy: req.user!.email },
    });
    success(res, updated, `Demande ${status === "approved" ? "approuvée" : "refusée"}`);
  } catch (e) { next(e); }
});

export default router;


