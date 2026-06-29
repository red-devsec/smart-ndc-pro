import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { requireAuth, requireRole, AuthRequest } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate";
import { payslipGenerateSchema } from "../validators";
import { success } from "../utils/response";
import { AppError } from "../middlewares/errorHandler";
import { generatePayslipPdf } from "../services/pdf.service";

const router = Router();
const prisma = new PrismaClient();

router.get("/", requireAuth, async (req, res, next) => {
  try {
    const employeeId = req.query.employeeId ? String(req.query.employeeId) : undefined;
    const month = req.query.month ? String(req.query.month) : undefined;
    const year = req.query.year ? String(req.query.year) : undefined;
    const where: any = {};
    if (employeeId) where.employeeId = employeeId;
    if (month) where.month = parseInt(month);
    if (year) where.year = parseInt(year);
    const slips = await prisma.paySlip.findMany({ where, include: { employee: true }, orderBy: [{ year: "desc" }, { month: "desc" }] });
    success(res, slips);
  } catch (e) { next(e); }
});

router.get("/my", requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const employee = await prisma.employee.findUnique({ where: { email: req.user!.email } });
    if (!employee) return success(res, []);
    const slips = await prisma.paySlip.findMany({
      where: { employeeId: employee.id },
      orderBy: [{ year: "desc" }, { month: "desc" }],
    });
    success(res, slips);
  } catch (e) { next(e); }
});

router.post("/generate", requireAuth, requireRole("ADMIN", "MANAGER", "RH"), validate(payslipGenerateSchema), async (req, res, next) => {
  try {
    const { employeeId, month, year } = req.body;
    const employee = await prisma.employee.findUnique({ where: { id: employeeId } });
    if (!employee) throw new AppError("Employé non trouvé", 404);

    const existing = await prisma.paySlip.findUnique({
      where: { employeeId_month_year: { employeeId, month, year } },
    });
    if (existing) throw new AppError("Bulletin déjà existant pour cette période", 400);

    const cnss = employee.salary * 0.0429;
    const tax = employee.salary > 10000 ? employee.salary * 0.1 : employee.salary * 0.05;
    const netSalary = employee.salary - cnss - tax;

    const url = await generatePayslipPdf({
      employeeName: `${employee.firstName} ${employee.lastName}`,
      month, year,
      baseSalary: employee.salary,
      bonuses: 0, overtime: 0, paidLeave: 0,
      cnss: Math.round(cnss * 100) / 100,
      tax: Math.round(tax * 100) / 100,
      netSalary: Math.round(netSalary * 100) / 100,
    });

    const slip = await prisma.paySlip.create({
      data: {
        employeeId, month, year,
        baseSalary: employee.salary,
        cnss: Math.round(cnss * 100) / 100,
        tax: Math.round(tax * 100) / 100,
        netSalary: Math.round(netSalary * 100) / 100,
        status: "draft",
      },
    });
    success(res, { ...slip, documentUrl: url }, "Bulletin généré");
  } catch (e) { next(e); }
});

router.put("/:id/validate", requireAuth, requireRole("ADMIN", "MANAGER"), async (req, res, next) => {
  try {
    const slip = await prisma.paySlip.update({ where: { id: String(req.params.id) }, data: { status: "validated" } });
    success(res, slip, "Bulletin validé");
  } catch (e) { next(e); }
});

export default router;


