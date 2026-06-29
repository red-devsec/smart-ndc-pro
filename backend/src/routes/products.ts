import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { requireAuth, requireRole } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate";
import { productSchema, productUpdateSchema } from "../validators";
import { AppError } from "../middlewares/errorHandler";
import { success } from "../utils/response";

const router = Router();
const prisma = new PrismaClient();

router.get("/", requireAuth, requireRole("ADMIN", "MANAGER", "RH", "MAGASINIER"), async (req, res, next) => {
  try {
    const search = req.query.search ? String(req.query.search) : undefined;
    const category = req.query.category ? String(req.query.category) : undefined;
    const where: any = {};
    if (category) where.categoryId = category;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { barcode: { contains: search } },
      ];
    }
    const products = await prisma.product.findMany({
      where, include: { category: true },
      orderBy: { createdAt: "desc" },
    });
    const mapped = products.map(p => ({ ...p, categoryName: (p as any).category?.name }));
    success(res, mapped);
  } catch (e) { next(e); }
});

router.get("/low-stock", requireAuth, requireRole("ADMIN", "MANAGER", "RH", "MAGASINIER"), async (_req, res, next) => {
  try {
    const products = await prisma.product.findMany({
      include: { category: true },
    });
    const lowStock = products.filter(p => p.quantity <= p.minThreshold);
    success(res, lowStock);
  } catch (e) { next(e); }
});

router.get("/barcode/:code", requireAuth, requireRole("ADMIN", "MANAGER", "RH", "MAGASINIER"), async (req, res, next) => {
  try {
    const product = await prisma.product.findUnique({
      where: { barcode: String(req.params.code) },
      include: { category: true },
    });
    if (!product) throw new AppError("Produit non trouvé", 404);
    success(res, { ...product, categoryName: (product as any).category?.name });
  } catch (e) { next(e); }
});

router.get("/:id", requireAuth, requireRole("ADMIN", "MANAGER", "RH", "MAGASINIER"), async (req, res, next) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: String(String(req.params.id)) },
      include: { category: true },
    });
    if (!product) throw new AppError("Produit non trouvé", 404);
    success(res, { ...product, categoryName: (product as any).category?.name });
  } catch (e) { next(e); }
});

router.post("/", requireAuth, requireRole("ADMIN", "MAGASINIER"), validate(productSchema), async (req, res, next) => {
  try {
    const { name, description, categoryId, barcode, barcodeFormat, price, quantity, minThreshold, location } = req.body;
    const product = await prisma.product.create({
      data: {
        name, description, categoryId, barcode, barcodeFormat: barcodeFormat || "EAN-13",
        price: parseFloat(price), quantity: parseInt(quantity) || 0,
        minThreshold: parseInt(minThreshold) || 5, location,
      },
    });
    success(res, product, "Produit créé");
  } catch (e) { next(e); }
});

router.put("/:id", requireAuth, requireRole("ADMIN", "MAGASINIER"), validate(productUpdateSchema), async (req, res, next) => {
  try {
    const product = await prisma.product.update({ where: { id: String(req.params.id) }, data: req.body });
    success(res, product, "Produit mis à jour");
  } catch (e) { next(e); }
});

router.delete("/:id", requireAuth, requireRole("ADMIN"), async (req, res, next) => {
  try {
    await prisma.product.delete({ where: { id: String(req.params.id) } });
    success(res, null, "Produit supprimé");
  } catch (e) { next(e); }
});

export default router;


