import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { requireAuth, requireRole, AuthRequest } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate";
import { movementSchema } from "../validators";
import { AppError } from "../middlewares/errorHandler";
import { success } from "../utils/response";
import { sendPushToRole } from "../services/notification.service";

const router = Router();
const prisma = new PrismaClient();

router.get("/", requireAuth, requireRole("ADMIN", "MANAGER", "RH", "MAGASINIER"), async (req, res, next) => {
  try {
    const productId = req.query.productId ? String(req.query.productId) : undefined;
    const employeeId = req.query.employeeId ? String(req.query.employeeId) : undefined;
    const type = req.query.type ? String(req.query.type) : undefined;
    const startDate = req.query.startDate ? String(req.query.startDate) : undefined;
    const endDate = req.query.endDate ? String(req.query.endDate) : undefined;
    const where: any = {};
    if (productId) where.productId = productId;
    if (employeeId) where.employeeId = employeeId;
    if (type) where.type = type;
    if (startDate && endDate) {
      where.timestamp = { gte: new Date(startDate), lte: new Date(endDate) };
    }

    const movements = await prisma.stockMovement.findMany({
      where, include: { product: true, employee: true },
      orderBy: { timestamp: "desc" },
    });
    const mapped = movements.map(m => ({
      ...m, productName: m.product.name, productBarcode: m.product.barcode,
      employeeName: `${m.employee.firstName} ${m.employee.lastName}`,
      product: undefined, employee: undefined,
    }));
    success(res, mapped);
  } catch (e) { next(e); }
});

router.get("/product/:id", requireAuth, requireRole("ADMIN", "MANAGER", "RH", "MAGASINIER"), async (req, res, next) => {
  try {
    const movements = await prisma.stockMovement.findMany({
      where: { productId: String(req.params.id) },
      include: { employee: true },
      orderBy: { timestamp: "desc" },
    });
    success(res, movements);
  } catch (e) { next(e); }
});

router.get("/employee/:id", requireAuth, requireRole("ADMIN", "MANAGER", "RH", "MAGASINIER"), async (req, res, next) => {
  try {
    const movements = await prisma.stockMovement.findMany({
      where: { employeeId: String(req.params.id) },
      include: { product: true },
      orderBy: { timestamp: "desc" },
    });
    success(res, movements);
  } catch (e) { next(e); }
});

router.post("/", requireAuth, requireRole("ADMIN", "MAGASINIER"), validate(movementSchema), async (req: AuthRequest, res, next) => {
  try {
    const { productId, type, reason, quantity, notes } = req.body;
    if (!productId || !type || !quantity) throw new AppError("Champs requis manquants", 400);

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new AppError("Produit non trouvé", 404);

    const employee = await prisma.employee.findUnique({ where: { email: req.user!.email } });
    if (!employee) throw new AppError("Employé non trouvé", 404);

    // Check if employee clocked in today
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const attendance = await prisma.attendance.findFirst({
      where: { employeeId: employee.id, date: today },
    });
    if (!attendance) {
      // Anomaly alert for ANY movement by an employee who hasn't pointed today
      await prisma.alert.create({
        data: {
          type: "absent_stock_movement",
          message: `Mouvement de stock (${type}) par ${employee.firstName} ${employee.lastName} sans pointage aujourd'hui`,
          severity: "error",
          relatedId: productId,
        },
      });
      await sendPushToRole("RH", "Anomalie stock", `Mouvement par ${employee.firstName} ${employee.lastName} sans pointage`);
      if (type === "out") {
        throw new AppError("Vous devez pointer avant de sortir du stock", 403);
      }
    }

    const qty = parseInt(quantity.toString());
    const newQty = type === "in" ? product.quantity + qty : product.quantity - qty;
    if (type === "out" && newQty < 0) throw new AppError("Stock insuffisant", 400);

    const movement = await prisma.stockMovement.create({
      data: { productId, type, reason, quantity: qty, employeeId: employee.id, notes },
    });

    await prisma.product.update({ where: { id: productId }, data: { quantity: newQty } });

    // Check low stock alert
    if (newQty <= product.minThreshold) {
      await prisma.alert.create({
        data: {
          type: "stock_low",
          message: `Stock bas: ${product.name} (${newQty} restant${newQty > 1 ? "s" : ""})`,
          severity: newQty === 0 ? "error" : "warning",
          relatedId: productId,
        },
      });
      await sendPushToRole("MAGASINIER", "Stock bas", `${product.name} est en dessous du seuil (${newQty} restants)`);
      await sendPushToRole("ADMIN", "Stock bas", `${product.name} est en dessous du seuil (${newQty} restants)`);
    }

    const io = req.app.get("io");
    io?.emit("movement:new", movement);

    success(res, movement, "Mouvement enregistré");
  } catch (e) { next(e); }
});

export default router;


