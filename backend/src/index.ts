import express from "express";
import cors from "cors";
import http from "http";
import { PrismaClient } from "@prisma/client";
import authRoutes from "./routes/auth";
import employeeRoutes from "./routes/employees";
import attendanceRoutes from "./routes/attendance";
import leaveRoutes from "./routes/leaves";
import productRoutes from "./routes/products";
import movementRoutes from "./routes/movements";
import alertRoutes from "./routes/alerts";
import reportRoutes from "./routes/reports";
import rfidRoutes from "./routes/rfid";
import certificateRoutes from "./routes/certificates";
import payslipRoutes from "./routes/payslips";
import userRoutes from "./routes/users";
import dashboardRoutes from "./routes/dashboard";
import adminRoutes from "./routes/admin";
import uploadRoutes from "./routes/uploads";
import settingsRoutes from "./routes/settings";
import { errorHandler } from "./middlewares/errorHandler";
import { createSocketServer } from "./socket";
import { ensureBucket } from "./services/storage.service";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";

const app = express();
const server = http.createServer(app);
const io = createSocketServer(server);
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.set("io", io);
app.set("prisma", prisma);

app.use("/api/auth", authRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/leaves", leaveRoutes);
app.use("/api/products", productRoutes);
app.use("/api/movements", movementRoutes);
app.use("/api/alerts", alertRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/rfid", rfidRoutes);
app.use("/api/certificates", certificateRoutes);
app.use("/api/payslips", payslipRoutes);
app.use("/api/users", userRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api/settings", settingsRoutes);

// Health endpoint (unauthenticated, for Docker healthcheck & load balancer)
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

// Swagger / OpenAPI documentation
const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Smart NDC Pro ERP API",
      version: "1.0.0",
      description: "API intégrée de gestion RH et Inventaire avec pointage RFID pour NDC Pro Maroc",
    },
    components: {
      securitySchemes: {
        bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ["./src/routes/*.ts"],
});
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(errorHandler);

// Init MinIO bucket on startup
ensureBucket().catch((err) => console.error("MinIO init error:", err));

// Auto-generate payslips for current month on startup (if not exists)
async function autoGeneratePayslips() {
  try {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    const employees = await prisma.employee.findMany({ where: { isActive: true } });
    for (const emp of employees) {
      const existing = await prisma.paySlip.findUnique({
        where: { employeeId_month_year: { employeeId: emp.id, month, year } },
      });
      if (!existing) {
        const cnss = Math.round(emp.salary * 0.0429 * 100) / 100;
        const tax = Math.round((emp.salary > 10000 ? emp.salary * 0.1 : emp.salary * 0.05) * 100) / 100;
        const netSalary = Math.round((emp.salary - cnss - tax) * 100) / 100;
        await prisma.paySlip.create({
          data: { employeeId: emp.id, month, year, baseSalary: emp.salary, cnss, tax, netSalary },
        });
      }
    }
    console.log("Bulletins de paie vérifiés/générés");
  } catch (err) {
    console.error("Erreur génération bulletins:", err.message);
  }
}
autoGeneratePayslips();

// Monthly leave balance accrual (Moroccan standard: 1.75 days/month ≈ 21 days/year)
async function accrueLeaveBalances() {
  try {
    const now = new Date();
    const currentMonth = now.getMonth(); // 0-11
    const employees = await prisma.employee.findMany({ where: { isActive: true } });
    let updated = 0;
    for (const emp of employees) {
      const lastAccrual = emp.lastAccrual ? new Date(emp.lastAccrual) : new Date(emp.hireDate || now);
      const lastAccrualMonth = lastAccrual.getMonth();
      const lastAccrualYear = lastAccrual.getFullYear();
      const monthsDiff = (now.getFullYear() - lastAccrualYear) * 12 + (currentMonth - lastAccrualMonth);
      if (monthsDiff >= 1) {
        const accrual = 1.75 * monthsDiff;
        await prisma.employee.update({
          where: { id: emp.id },
          data: {
            leaveBalance: { increment: accrual },
            lastAccrual: new Date(now.getFullYear(), currentMonth, 1),
          },
        });
        updated++;
      }
    }
    if (updated > 0) console.log(`Soldes de congés mis à jour pour ${updated} employés`);
  } catch (err) {
    console.error("Erreur accrétion congés:", err.message);
  }
}
accrueLeaveBalances();
// Recheck every hour
setInterval(accrueLeaveBalances, 60 * 60 * 1000);

const PORT = Number(process.env.PORT) || 3001;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});

export { app, server, io, prisma };
