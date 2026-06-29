import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { requireAuth, requireRole, AuthRequest } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate";
import { employeeSchema, employeeUpdateSchema } from "../validators";
import { AppError } from "../middlewares/errorHandler";
import { success } from "../utils/response";

const router = Router();
const prisma = new PrismaClient();

router.get("/", requireAuth, requireRole("ADMIN", "RH"), async (req: AuthRequest, res, next) => {
  try {
    const search = req.query.search ? String(req.query.search) : undefined;
    const department = req.query.department ? String(req.query.department) : undefined;
    const where: any = { isActive: true };
    if (department) where.departmentId = department;
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }
    const employees = await prisma.employee.findMany({
      where, include: { department: true, rfidCards: true },
      orderBy: { createdAt: "desc" },
    });
    const mapped = employees.map(e => {
      const dept = (e as any).department;
      const cards = (e as any).rfidCards;
      return { ...e, departmentName: dept?.name, cardUid: cards?.[0]?.uid, rfidCardId: cards?.[0]?.id };
    });
    success(res, mapped);
  } catch (e) { next(e); }
});

router.get("/:id", requireAuth, requireRole("ADMIN", "RH"), async (req, res, next) => {
  try {
    const emp = await prisma.employee.findUnique({
      where: { id: String(req.params.id) },
      include: { department: true, rfidCards: true },
    });
    if (!emp) throw new AppError("Employé non trouvé", 404);
    const dept = (emp as any).department;
    success(res, { ...emp, departmentName: dept?.name });
  } catch (e) { next(e); }
});

router.post("/", requireAuth, requireRole("ADMIN", "RH"), validate(employeeSchema), async (req, res, next) => {
  try {
    const { firstName, lastName, email, phone, position, departmentId, hireDate, salary } = req.body;
    const emp = await prisma.employee.create({
      data: {
        firstName, lastName, email, phone, position, departmentId,
        hireDate: new Date(hireDate), salary: parseFloat(salary),
      },
    });
    success(res, emp, "Employé créé");
  } catch (e) { next(e); }
});

router.put("/:id", requireAuth, requireRole("ADMIN", "RH"), validate(employeeUpdateSchema), async (req, res, next) => {
  try {
    const emp = await prisma.employee.update({
      where: { id: String(req.params.id) },
      data: req.body,
    });
    success(res, emp, "Employé mis à jour");
  } catch (e) { next(e); }
});

router.delete("/:id", requireAuth, requireRole("ADMIN"), async (req, res, next) => {
  try {
    await prisma.employee.update({ where: { id: String(req.params.id) }, data: { isActive: false } });
    success(res, null, "Employé désactivé");
  } catch (e) { next(e); }
});

export default router;


