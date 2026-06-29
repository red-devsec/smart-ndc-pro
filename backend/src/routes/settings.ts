import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { requireAuth, requireRole, AuthRequest } from "../middlewares/auth.middleware";
import { AppError } from "../middlewares/errorHandler";
import { success } from "../utils/response";
import { reloadTemplateCache } from "../services/pdf.service";

const router = Router();
const prisma = new PrismaClient();

const TEMPLATE_KEYS = [
  "template_companyName",
  "template_companySubtitle",
  "template_companyPhone",
  "template_companyEmail",
  "template_city",
  "template_primaryColor",
  "template_signatureText",
  "template_logoUrl",
];

router.get("/template", requireAuth, requireRole("ADMIN"), async (_req, res, next) => {
  try {
    const settings = await prisma.setting.findMany({
      where: { key: { startsWith: "template_" } },
    });
    const map: Record<string, string> = {};
    for (const key of TEMPLATE_KEYS) {
      map[key.replace("template_", "")] = settings.find((s) => s.key === key)?.value || "";
    }
    success(res, map);
  } catch (e) { next(e); }
});

router.put("/template", requireAuth, requireRole("ADMIN"), async (req: AuthRequest, res, next) => {
  try {
    const allowed = new Set(TEMPLATE_KEYS);
    const entries = Object.entries(req.body)
      .filter(([key]) => allowed.has("template_" + key))
      .map(([key, value]) => ({
        key: "template_" + key,
        value: String(value),
      }));

    const updated: Record<string, string> = {};
    for (const entry of entries) {
      await prisma.setting.upsert({
        where: { key: entry.key },
        update: { value: entry.value },
        create: entry,
      });
      updated[entry.key.replace("template_", "")] = entry.value;
    }

    reloadTemplateCache(updated);
    success(res, null, "Paramètres du template mis à jour");
  } catch (e) { next(e); }
});

// Register FCM push token for the authenticated user's mobile app
router.post("/push-token", requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const { token } = req.body;
    if (!token) throw new AppError("Token FCM requis", 400);
    const userId = req.user!.id;
    await prisma.setting.upsert({
      where: { key: `push_token:${userId}` },
      update: { value: token },
      create: { key: `push_token:${userId}`, value: token },
    });
    success(res, null, "Token push enregistré");
  } catch (e) { next(e); }
});

export default router;
