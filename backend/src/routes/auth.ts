import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { AppError } from "../middlewares/errorHandler";
import { requireAuth, AuthRequest } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate";
import { loginSchema, registerSchema } from "../validators";
import { success } from "../utils/response";
import { registerPushToken } from "../services/notification.service";

const router = Router();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "smartndc-jwt-secret-2026";

router.post("/login", validate(loginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) throw new AppError("Email et mot de passe requis", 400);

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new AppError("Email ou mot de passe incorrect", 401);
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: "24h" });
    await prisma.session.create({ data: { userId: user.id, token, expiresAt: new Date(Date.now() + 86400000) } });

    success(res, { token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  } catch (e) { next(e); }
});

router.post("/register", validate(registerSchema), async (req, res, next) => {
  try {
    const { email, password, name, role } = req.body;
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) throw new AppError("Cet email est déjà utilisé", 400);

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, password: hashed, name, role: role || "EMPLOYE" },
    });
    success(res, { id: user.id, email: user.email, name: user.name, role: user.role }, "Utilisateur créé");
  } catch (e) { next(e); }
});

router.get("/me", requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { id: true, email: true, name: true, role: true, avatar: true, createdAt: true },
    });
    success(res, user);
  } catch (e) { next(e); }
});

router.post("/logout", requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const header = req.headers.authorization!;
    const token = header.split(" ")[1];
    await prisma.session.deleteMany({ where: { token } });
    success(res, null, "Déconnexion réussie");
  } catch (e) { next(e); }
});

router.post("/push-token", requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const { token } = req.body;
    if (!token) throw new AppError("Token requis", 400);
    await registerPushToken(req.user!.id, token);
    success(res, null, "Token push enregistré");
  } catch (e) { next(e); }
});

export default router;


