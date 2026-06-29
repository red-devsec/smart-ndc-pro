import { Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
import { AuthRequest } from "./auth.middleware";
import { AppError } from "./errorHandler";

const prisma = new PrismaClient();

/**
 * Vérifie que l'employé a pointé aujourd'hui avant de permettre une sortie de stock.
 * Lien RH-Stock : pas de sortie si employé absent.
 */
export async function requirePresence(req: AuthRequest, _res: Response, next: NextFunction) {
  try {
    const employeeId = req.body.employeeId || req.user?.id;
    if (!employeeId) return next(new AppError("Employé non spécifié", 400));

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await prisma.attendance.findFirst({
      where: { employeeId, date: today },
    });

    if (!attendance) {
      return next(new AppError(
        "Pointage requis avant toute sortie de stock. L'employé doit pointer sa présence.",
        403
      ));
    }

    next();
  } catch (e) {
    next(e);
  }
}
