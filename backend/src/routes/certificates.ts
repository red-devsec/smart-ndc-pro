import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { requireAuth, requireRole, AuthRequest } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate";
import { certificateSchema, certificateStatusSchema } from "../validators";
import { success } from "../utils/response";
import { AppError } from "../middlewares/errorHandler";
import { generateAttestationPdf } from "../services/pdf.service";

const router = Router();
const prisma = new PrismaClient();

router.get("/", requireAuth, requireRole("ADMIN", "MANAGER", "RH"), async (req, res, next) => {
  try {
    const data = await prisma.certificateRequest.findMany({ include: { employee: true }, orderBy: { createdAt: "desc" } });
    success(res, data);
  } catch (e) { next(e); }
});

router.get("/my", requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const employee = await prisma.employee.findUnique({ where: { email: req.user!.email } });
    if (!employee) return success(res, []);
    const data = await prisma.certificateRequest.findMany({
      where: { employeeId: employee.id },
      orderBy: { createdAt: "desc" },
    });
    success(res, data);
  } catch (e) { next(e); }
});

router.post("/", requireAuth, validate(certificateSchema), async (req: AuthRequest, res, next) => {
  try {
    const { type } = req.body;
    const employee = await prisma.employee.findUnique({ where: { email: req.user!.email } });
    if (!employee) throw new AppError("Employé non trouvé", 404);
    const cr = await prisma.certificateRequest.create({ data: { employeeId: employee.id, type } });
    success(res, cr, "Demande envoyée");
  } catch (e) { next(e); }
});

router.put("/:id/status", requireAuth, requireRole("ADMIN", "MANAGER", "RH"), validate(certificateStatusSchema), async (req, res, next) => {
  try {
    const { status } = req.body;
    const cr = await prisma.certificateRequest.findUnique({
      where: { id: String(req.params.id) },
      include: { employee: true },
    });
    if (!cr) throw new AppError("Demande non trouvée", 404);

    if (status === "generated" && cr.status !== "generated") {
      const typeMap: Record<string, "work" | "salary" | "tax"> = {
        work: "work", salary: "salary", tax: "tax",
      };
      const url = await generateAttestationPdf(typeMap[cr.type] || "work", {
        employeeName: `${cr.employee.firstName} ${cr.employee.lastName}`,
        employeePosition: cr.employee.position,
        hireDate: cr.employee.hireDate.toLocaleDateString("fr-FR"),
        salary: cr.employee.salary,
      });
      const updated = await prisma.certificateRequest.update({
        where: { id: String(req.params.id) },
        data: { status: "generated", documentUrl: url },
      });
      return success(res, updated, "Attestation générée");
    }

    const updated = await prisma.certificateRequest.update({
      where: { id: String(req.params.id) },
      data: { status },
    });
    success(res, updated);
  } catch (e) { next(e); }
});

export default router;


