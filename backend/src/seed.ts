import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  await prisma.$transaction([
    prisma.stockMovement.deleteMany(),
    prisma.attendance.deleteMany(),
    prisma.leave.deleteMany(),
    prisma.certificateRequest.deleteMany(),
    prisma.paySlip.deleteMany(),
    prisma.employeePerformance.deleteMany(),
    prisma.alert.deleteMany(),
    prisma.notification.deleteMany(),
    prisma.session.deleteMany(),
    prisma.product.deleteMany(),
    prisma.productCategory.deleteMany(),
    prisma.rfidCard.deleteMany(),
    prisma.employee.deleteMany(),
    prisma.department.deleteMany(),
    prisma.user.deleteMany(),
    prisma.setting.deleteMany(),
  ]);

  // Users — role names MUST match UserRole in shared/types.ts: ADMIN, RH, MANAGER, MAGASINIER, EMPLOYE
  const hash = await bcrypt.hash("admin123", 10);
  const hashRH = await bcrypt.hash("rh123", 10);
  const hashM = await bcrypt.hash("manager123", 10);
  const hashE = await bcrypt.hash("emp123", 10);
  const hashS = await bcrypt.hash("store123", 10);
  const hashDaf = await bcrypt.hash("daf123", 10);

  await prisma.user.createMany({ data: [
    { email: "admin@smartndc.ma", password: hash, name: "Admin NDC", role: "ADMIN" },
    { email: "rh@smartndc.ma", password: hashRH, name: "Nadia Ouazzani", role: "RH" },
    { email: "manager@smartndc.ma", password: hashM, name: "Karim Benali", role: "MANAGER" },
    { email: "employee@smartndc.ma", password: hashE, name: "Sara El Amrani", role: "EMPLOYE" },
    { email: "store@smartndc.ma", password: hashS, name: "Hicham Tazi", role: "MAGASINIER" },
    { email: "daf@smartndc.ma", password: hashDaf, name: "Fatima Zahra", role: "MANAGER" },
  ]});

  // Departments
  await prisma.department.createMany({ data: [
    { name: "Direction" }, { name: "Commercial" }, { name: "Technique" },
    { name: "RH & Administration" }, { name: "Logistique" }, { name: "Finance" },
  ]});

  const depts = await prisma.department.findMany();

  // Employees
  const emps = await prisma.$transaction([
    prisma.employee.create({ data: { firstName: "Karim", lastName: "Benali", email: "k.benali@smartndc.ma", phone: "0612345678", position: "Chef Commercial", departmentId: depts[1].id, hireDate: new Date("2020-03-15"), salary: 15000 } }),
    prisma.employee.create({ data: { firstName: "Sara", lastName: "El Amrani", email: "s.elamrani@smartndc.ma", phone: "0612345679", position: "Chargée RH", departmentId: depts[3].id, hireDate: new Date("2021-06-01"), salary: 12000 } }),
    prisma.employee.create({ data: { firstName: "Hicham", lastName: "Tazi", email: "h.tazi@smartndc.ma", phone: "0612345680", position: "Magasinier", departmentId: depts[4].id, hireDate: new Date("2022-01-10"), salary: 8000 } }),
    prisma.employee.create({ data: { firstName: "Nadia", lastName: "Ouazzani", email: "n.ouazzani@smartndc.ma", phone: "0612345681", position: "Commerciale", departmentId: depts[1].id, hireDate: new Date("2022-09-20"), salary: 9000 } }),
    prisma.employee.create({ data: { firstName: "Youssef", lastName: "Hamidi", email: "y.hamidi@smartndc.ma", phone: "0612345682", position: "Technicien", departmentId: depts[2].id, hireDate: new Date("2023-02-14"), salary: 10000 } }),
    prisma.employee.create({ data: { firstName: "Fatima", lastName: "Zahra", email: "f.zahra@smartndc.ma", phone: "0612345683", position: "Comptable", departmentId: depts[5].id, hireDate: new Date("2021-11-01"), salary: 11000 } }),
    prisma.employee.create({ data: { firstName: "Omar", lastName: "Bennis", email: "o.bennis@smartndc.ma", phone: "0612345684", position: "Directeur", departmentId: depts[0].id, hireDate: new Date("2019-01-01"), salary: 25000 } }),
  ]);

  // RFID Cards
  await prisma.rfidCard.createMany({ data: [
    { uid: "A1:B2:C3:D4", employeeId: emps[0].id, isActive: true, assignedAt: new Date("2024-01-15") },
    { uid: "E5:F6:G7:H8", employeeId: emps[1].id, isActive: true, assignedAt: new Date("2024-01-15") },
    { uid: "I9:J0:K1:L2", employeeId: emps[2].id, isActive: true, assignedAt: new Date("2024-01-20") },
    { uid: "M3:N4:O5:P6", employeeId: emps[3].id, isActive: true, assignedAt: new Date("2024-02-01") },
    { uid: "Q7:R8:S9:T0", employeeId: emps[4].id, isActive: true, assignedAt: new Date("2024-02-01") },
    { uid: "U1:V2:W3:X4", employeeId: emps[5].id, isActive: true, assignedAt: new Date("2024-02-10") },
    { uid: "Y5:Z6:A7:B8", employeeId: emps[6].id, isActive: true, assignedAt: new Date("2024-01-15") },
    { uid: "UNASSIGNED-01", isActive: true },
    { uid: "UNASSIGNED-02", isActive: true },
  ]});

  // Product Categories
  await prisma.productCategory.createMany({ data: [
    { name: "PC" }, { name: "Imprimante" }, { name: "Scanner" },
    { name: "Terminal mobile" }, { name: "Écran" }, { name: "Accessoire" },
    { name: "Réseau" }, { name: "Lecteur code-barres" },
  ]});

  const cats = await prisma.productCategory.findMany();

  // Products
  await prisma.product.createMany({ data: [
    { name: "PC Portable HP EliteBook 840", description: "Intel i7, 16Go RAM, 512Go SSD", categoryId: cats[0].id, barcode: "8712345678900", price: 12500, quantity: 15, minThreshold: 5, location: "A1-01" },
    { name: "PC Portable Dell Latitude 5540", description: "Intel i5, 8Go RAM, 256Go SSD", categoryId: cats[0].id, barcode: "8712345678901", price: 9800, quantity: 3, minThreshold: 5, location: "A1-02" },
    { name: "Imprimante HP LaserJet Pro M404dn", description: "Noir et blanc, 38ppm", categoryId: cats[1].id, barcode: "8712345678902", price: 4500, quantity: 8, minThreshold: 3, location: "B2-01" },
    { name: "Imprimante HP Color LaserJet M454dw", description: "Couleur, 28ppm", categoryId: cats[1].id, barcode: "8712345678903", price: 8500, quantity: 4, minThreshold: 2, location: "B2-02" },
    { name: "Scanner Brother ADS-2700W", description: "Document, WiFi, 35ppm", categoryId: cats[2].id, barcode: "8712345678904", price: 3200, quantity: 6, minThreshold: 2, location: "C3-01" },
    { name: "Terminal Zebra TC21", description: "Android, 4Go RAM, 64Go", categoryId: cats[3].id, barcode: "8712345678905", price: 7500, quantity: 2, minThreshold: 5, location: "D4-01" },
    { name: "Terminal Zebra TC26", description: "Android, 4Go RAM, 32Go", categoryId: cats[3].id, barcode: "8712345678906", price: 6500, quantity: 0, minThreshold: 3, location: "D4-02" },
    { name: "Écran Dell 27\" P2723DE", description: "IPS, 2560x1440, USB-C", categoryId: cats[4].id, barcode: "8712345678907", price: 4200, quantity: 12, minThreshold: 4, location: "E5-01" },
    { name: "Clavier Logitech MK270", description: "Sans fil, combo souris", categoryId: cats[5].id, barcode: "8712345678908", price: 350, quantity: 25, minThreshold: 10, location: "F6-01" },
    { name: "Switch Cisco 48 ports", description: "Gigabit, managed", categoryId: cats[6].id, barcode: "8712345678909", price: 15000, quantity: 2, minThreshold: 2, location: "G7-01" },
    { name: "Lecteur Zebra RFD8500", description: "RFID, Bluetooth", categoryId: cats[7].id, barcode: "8712345678910", price: 3500, quantity: 4, minThreshold: 1, location: "H8-01" },
    { name: "Câble HDMI 2m", description: "HDMI 2.0, 4K", categoryId: cats[5].id, barcode: "8712345678911", price: 80, quantity: 50, minThreshold: 20, location: "F6-02" },
  ]});

  // Attendance
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const yesterday = new Date(Date.now() - 86400000); yesterday.setHours(0, 0, 0, 0);

  await prisma.attendance.createMany({ data: [
    { employeeId: emps[0].id, checkIn: new Date(`${today.toISOString().split("T")[0]}T08:15:00`), date: today, status: "present" },
    { employeeId: emps[1].id, checkIn: new Date(`${today.toISOString().split("T")[0]}T08:00:00`), date: today, status: "present" },
    { employeeId: emps[2].id, checkIn: new Date(`${today.toISOString().split("T")[0]}T07:55:00`), date: today, location: "warehouse", status: "present" },
    { employeeId: emps[4].id, checkIn: new Date(`${today.toISOString().split("T")[0]}T08:05:00`), date: today, status: "present" },
    { employeeId: emps[3].id, checkIn: new Date(`${today.toISOString().split("T")[0]}T08:30:00`), date: today, status: "late" },
    { employeeId: emps[0].id, checkIn: new Date(`${yesterday.toISOString().split("T")[0]}T08:10:00`), checkOut: new Date(`${yesterday.toISOString().split("T")[0]}T17:15:00`), hoursWorked: 8.08, date: yesterday, status: "present" },
    { employeeId: emps[1].id, checkIn: new Date(`${yesterday.toISOString().split("T")[0]}T08:00:00`), checkOut: new Date(`${yesterday.toISOString().split("T")[0]}T16:30:00`), hoursWorked: 7.5, date: yesterday, status: "present" },
  ]});

  // Leaves
  await prisma.leave.createMany({ data: [
    { employeeId: emps[3].id, type: "annual", startDate: new Date("2026-06-20"), endDate: new Date("2026-06-25"), reason: "Vacances annuelles", status: "approved", reviewedBy: "manager@smartndc.ma" },
    { employeeId: emps[4].id, type: "sick", startDate: new Date("2026-06-10"), endDate: new Date("2026-06-11"), reason: "Maladie", status: "approved", reviewedBy: "manager@smartndc.ma" },
    { employeeId: emps[5].id, type: "personal", startDate: new Date("2026-06-28"), endDate: new Date("2026-06-28"), reason: "Raison personnelle", status: "pending" },
  ]});

  // Stock movements
  const allProducts = await prisma.product.findMany();
  const prodByBarcode = Object.fromEntries(allProducts.map(p => [p.barcode, p.id]));

  await prisma.stockMovement.createMany({ data: [
    { productId: prodByBarcode["8712345678900"], type: "in", reason: "replenishment", quantity: 10, employeeId: emps[2].id, timestamp: new Date("2026-06-10T09:00:00Z"), notes: "Réappro fournisseur" },
    { productId: prodByBarcode["8712345678901"], type: "out", reason: "sale", quantity: 2, employeeId: emps[0].id, timestamp: new Date("2026-06-11T14:30:00Z"), notes: "Vente ABC SARL" },
    { productId: prodByBarcode["8712345678905"], type: "out", reason: "internal_use", quantity: 1, employeeId: emps[4].id, timestamp: new Date("2026-06-12T10:00:00Z"), notes: "Prêt technique" },
    { productId: prodByBarcode["8712345678902"], type: "out", reason: "sale", quantity: 1, employeeId: emps[3].id, timestamp: new Date("2026-06-12T11:00:00Z") },
    { productId: prodByBarcode["8712345678906"], type: "out", reason: "damaged", quantity: 1, employeeId: emps[4].id, timestamp: new Date("2026-06-13T15:00:00Z") },
    { productId: prodByBarcode["8712345678908"], type: "in", reason: "replenishment", quantity: 20, employeeId: emps[2].id, timestamp: new Date("2026-06-13T08:30:00Z") },
  ]});

  await prisma.alert.createMany({ data: [
    { type: "stock_low", message: "Stock critique: Terminal Zebra TC26 (0 unité)", severity: "error", relatedId: prodByBarcode["8712345678906"] },
    { type: "stock_low", message: "Stock bas: Dell Latitude 5540 (3 unités)", severity: "warning", relatedId: prodByBarcode["8712345678901"] },
    { type: "leave_pending", message: "Demande de congé en attente - Fatima Zahra", severity: "info" },
  ]});

  console.log("Seed completed successfully!");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
