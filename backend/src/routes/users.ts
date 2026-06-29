import { Router } from "express";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { requireAuth, requireRole } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate";
import { userSchema, userUpdateSchema } from "../validators";
import { AppError } from "../middlewares/errorHandler";
import { success } from "../utils/response";

const router = Router();
const prisma = new PrismaClient();

router.get("/", requireAuth, requireRole("ADMIN"), async (_req, res, next) => {
  try {
    const users = await prisma.user.findMany({ select: { id: true, email: true, name: true, role: true, avatar: true, isActive: true, createdAt: true } });
    success(res, users);
  } catch (e) { next(e); }
});

router.post("/", requireAuth, requireRole("ADMIN"), validate(userSchema), async (req, res, next) => {
  try {
    const { email, password, name, role } = req.body;
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) throw new AppError("Email déjà utilisé", 400);
    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({ data: { email, password: hashed, name, role } });
    success(res, { id: user.id, email: user.email, name: user.name, role: user.role }, "Utilisateur créé");
  } catch (e) { next(e); }
});

router.put("/:id", requireAuth, requireRole("ADMIN"), validate(userUpdateSchema), async (req, res, next) => {
  try {
    const data: any = { ...req.body };
    if (data.password) data.password = await bcrypt.hash(data.password, 10);
    const user = await prisma.user.update({ where: { id: String(req.params.id) }, data });
    success(res, user, "Utilisateur mis à jour");
  } catch (e) { next(e); }
});

router.delete("/:id", requireAuth, requireRole("ADMIN"), async (req, res, next) => {
  try {
    await prisma.user.update({ where: { id: String(req.params.id) }, data: { isActive: false } });
    success(res, null, "Utilisateur désactivé");
  } catch (e) { next(e); }
});

export default router;


