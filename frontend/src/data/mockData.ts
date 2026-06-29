import type {
  User, Employee, Department, RfidCard, Attendance, Leave,
  Product, ProductCategory, StockMovement, Alert, Notification,
  CertificateRequest, PaySlip, MovementReason
} from "./types";

export const departments: Department[] = [
  { id: "d1", name: "Direction" },
  { id: "d2", name: "Commercial" },
  { id: "d3", name: "Technique" },
  { id: "d4", name: "RH & Administration" },
  { id: "d5", name: "Logistique" },
  { id: "d6", name: "Finance" },
];

export const users: User[] = [
  { id: "u1", email: "admin@smartndc.ma", password: "admin123", name: "Admin NDC", role: "ADMIN" },
  { id: "u2", email: "manager@smartndc.ma", password: "manager123", name: "Karim Benali", role: "RH", employeeId: "e1" },
  { id: "u3", email: "employee@smartndc.ma", password: "emp123", name: "Sara El Amrani", role: "EMPLOYE", employeeId: "e2" },
  { id: "u4", email: "store@smartndc.ma", password: "store123", name: "Hicham Tazi", role: "MAGASINIER", employeeId: "e3" },
  { id: "u5", email: "daf@smartndc.ma", password: "daf123", name: "Fatima Zahra", role: "MANAGER", employeeId: "e6" },
];

export const employees: Employee[] = [
  { id: "e1", firstName: "Karim", lastName: "Benali", email: "k.benali@smartndc.ma", phone: "0612345678", position: "Chef Commercial", departmentId: "d2", departmentName: "Commercial", hireDate: "2020-03-15", salary: 15000, rfidCardId: "rfid1", cardUid: "A1:B2:C3:D4", isActive: true, createdAt: "2020-03-15T08:00:00Z" },
  { id: "e2", firstName: "Sara", lastName: "El Amrani", email: "s.elamrani@smartndc.ma", phone: "0612345679", position: "Chargée RH", departmentId: "d4", departmentName: "RH & Administration", hireDate: "2021-06-01", salary: 12000, rfidCardId: "rfid2", cardUid: "E5:F6:G7:H8", isActive: true, createdAt: "2021-06-01T08:00:00Z" },
  { id: "e3", firstName: "Hicham", lastName: "Tazi", email: "h.tazi@smartndc.ma", phone: "0612345680", position: "Magasinier", departmentId: "d5", departmentName: "Logistique", hireDate: "2022-01-10", salary: 8000, rfidCardId: "rfid3", cardUid: "I9:J0:K1:L2", isActive: true, createdAt: "2022-01-10T08:00:00Z" },
  { id: "e4", firstName: "Nadia", lastName: "Ouazzani", email: "n.ouazzani@smartndc.ma", phone: "0612345681", position: "Commerciale", departmentId: "d2", departmentName: "Commercial", hireDate: "2022-09-20", salary: 9000, rfidCardId: "rfid4", cardUid: "M3:N4:O5:P6", isActive: true, createdAt: "2022-09-20T08:00:00Z" },
  { id: "e5", firstName: "Youssef", lastName: "Hamidi", email: "y.hamidi@smartndc.ma", phone: "0612345682", position: "Technicien", departmentId: "d3", departmentName: "Technique", hireDate: "2023-02-14", salary: 10000, rfidCardId: "rfid5", cardUid: "Q7:R8:S9:T0", isActive: true, createdAt: "2023-02-14T08:00:00Z" },
  { id: "e6", firstName: "Fatima", lastName: "Zahra", email: "f.zahra@smartndc.ma", phone: "0612345683", position: "Comptable", departmentId: "d6", departmentName: "Finance", hireDate: "2021-11-01", salary: 11000, rfidCardId: "rfid6", cardUid: "U1:V2:W3:X4", isActive: true, createdAt: "2021-11-01T08:00:00Z" },
  { id: "e7", firstName: "Omar", lastName: "Bennis", email: "o.bennis@smartndc.ma", phone: "0612345684", position: "Directeur", departmentId: "d1", departmentName: "Direction", hireDate: "2019-01-01", salary: 25000, rfidCardId: "rfid7", cardUid: "Y5:Z6:A7:B8", isActive: true, createdAt: "2019-01-01T08:00:00Z" },
  { id: "e8", firstName: "Leila", lastName: "Fassi", email: "l.fassi@smartndc.ma", phone: "0612345685", position: "Assistante RH", departmentId: "d4", departmentName: "RH & Administration", hireDate: "2023-06-15", salary: 7000, rfidCardId: "rfid8", cardUid: "C9:D0:E1:F2", isActive: false, createdAt: "2023-06-15T08:00:00Z" },
];

export const rfidCards: RfidCard[] = [
  { id: "rfid1", uid: "A1:B2:C3:D4", employeeId: "e1", employeeName: "Karim Benali", isActive: true, assignedAt: "2024-01-15" },
  { id: "rfid2", uid: "E5:F6:G7:H8", employeeId: "e2", employeeName: "Sara El Amrani", isActive: true, assignedAt: "2024-01-15" },
  { id: "rfid3", uid: "I9:J0:K1:L2", employeeId: "e3", employeeName: "Hicham Tazi", isActive: true, assignedAt: "2024-01-20" },
  { id: "rfid4", uid: "M3:N4:O5:P6", employeeId: "e4", employeeName: "Nadia Ouazzani", isActive: true, assignedAt: "2024-02-01" },
  { id: "rfid5", uid: "Q7:R8:S9:T0", employeeId: "e5", employeeName: "Youssef Hamidi", isActive: true, assignedAt: "2024-02-01" },
  { id: "rfid6", uid: "U1:V2:W3:X4", employeeId: "e6", employeeName: "Fatima Zahra", isActive: true, assignedAt: "2024-02-10" },
  { id: "rfid7", uid: "Y5:Z6:A7:B8", employeeId: "e7", employeeName: "Omar Bennis", isActive: true, assignedAt: "2024-01-15" },
  { id: "rfid8", uid: "C9:D0:E1:F2", employeeId: "e8", employeeName: "Leila Fassi", isActive: false, assignedAt: "2024-03-01" },
  { id: "rfid9", uid: "UNASSIGNED-01", isActive: true },
  { id: "rfid10", uid: "UNASSIGNED-02", isActive: true },
];

const today = new Date().toISOString().split("T")[0];
const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
const twoDaysAgo = new Date(Date.now() - 2 * 86400000).toISOString().split("T")[0];

export const attendanceRecords: Attendance[] = [
  { id: "a1", employeeId: "e1", employeeName: "Karim Benali", checkIn: `${today}T08:15:00`, checkOut: `${today}T17:30:00`, hoursWorked: 8.25, date: today, location: "office", status: "present" },
  { id: "a2", employeeId: "e2", employeeName: "Sara El Amrani", checkIn: `${today}T08:00:00`, checkOut: `${today}T16:45:00`, hoursWorked: 7.75, date: today, location: "office", status: "present" },
  { id: "a3", employeeId: "e3", employeeName: "Hicham Tazi", checkIn: `${today}T07:55:00`, checkOut: undefined, hoursWorked: undefined, date: today, location: "warehouse", status: "present" },
  { id: "a4", employeeId: "e4", employeeName: "Nadia Ouazzani", checkIn: `${today}T08:30:00`, checkOut: undefined, hoursWorked: undefined, date: today, location: "office", status: "late" },
  { id: "a5", employeeId: "e5", employeeName: "Youssef Hamidi", checkIn: `${today}T08:05:00`, checkOut: `${today}T18:00:00`, hoursWorked: 8.92, date: today, location: "office", status: "present" },
  { id: "a6", employeeId: "e6", employeeName: "Fatima Zahra", checkIn: `${today}T08:10:00`, checkOut: undefined, hoursWorked: undefined, date: today, location: "office", status: "present" },
  { id: "a7", employeeId: "e7", employeeName: "Omar Bennis", checkIn: `${today}T09:00:00`, checkOut: `${today}T17:00:00`, hoursWorked: 7.0, date: today, location: "office", status: "late" },
  { id: "a8", employeeId: "e1", employeeName: "Karim Benali", checkIn: `${yesterday}T08:10:00`, checkOut: `${yesterday}T17:15:00`, hoursWorked: 8.08, date: yesterday, location: "office", status: "present" },
  { id: "a9", employeeId: "e2", employeeName: "Sara El Amrani", checkIn: `${yesterday}T08:00:00`, checkOut: `${yesterday}T16:30:00`, hoursWorked: 7.5, date: yesterday, location: "office", status: "present" },
  { id: "a10", employeeId: "e3", employeeName: "Hicham Tazi", checkIn: `${yesterday}T07:50:00`, checkOut: `${yesterday}T17:00:00`, hoursWorked: 8.17, date: yesterday, location: "warehouse", status: "present" },
  { id: "a11", employeeId: "e4", employeeName: "Nadia Ouazzani", checkIn: `${twoDaysAgo}T08:00:00`, checkOut: `${twoDaysAgo}T17:00:00`, hoursWorked: 8.0, date: twoDaysAgo, location: "office", status: "present" },
  { id: "a12", employeeId: "e5", employeeName: "Youssef Hamidi", checkIn: `${yesterday}T08:00:00`, checkOut: `${yesterday}T17:30:00`, hoursWorked: 8.5, date: yesterday, location: "office", status: "present" },
];

export const leaves: Leave[] = [
  { id: "l1", employeeId: "e4", employeeName: "Nadia Ouazzani", type: "annual", startDate: "2026-06-20", endDate: "2026-06-25", reason: "Vacances annuelles", status: "approved", createdAt: "2026-06-01T10:00:00Z", reviewedBy: "Karim Benali" },
  { id: "l2", employeeId: "e5", employeeName: "Youssef Hamidi", type: "sick", startDate: "2026-06-10", endDate: "2026-06-11", reason: "Maladie", status: "approved", createdAt: "2026-06-10T08:00:00Z", reviewedBy: "Karim Benali" },
  { id: "l3", employeeId: "e6", employeeName: "Fatima Zahra", type: "personal", startDate: "2026-06-28", endDate: "2026-06-28", reason: "Raison personnelle", status: "pending", createdAt: "2026-06-14T09:00:00Z" },
];

export const categories: ProductCategory[] = [
  { id: "c1", name: "PC" },
  { id: "c2", name: "Imprimante" },
  { id: "c3", name: "Scanner" },
  { id: "c4", name: "Terminal mobile" },
  { id: "c5", name: "Écran" },
  { id: "c6", name: "Accessoire" },
  { id: "c7", name: "Réseau" },
  { id: "c8", name: "Lecteur code-barres" },
];

export const products: Product[] = [
  { id: "p1", name: "PC Portable HP EliteBook 840", description: "Intel i7, 16Go RAM, 512Go SSD", category: "PC", categoryId: "c1", barcode: "8712345678900", barcodeFormat: "EAN-13", price: 12500, quantity: 15, minThreshold: 5, location: "A1-01", createdAt: "2024-01-15T10:00:00Z" },
  { id: "p2", name: "PC Portable Dell Latitude 5540", description: "Intel i5, 8Go RAM, 256Go SSD", category: "PC", categoryId: "c1", barcode: "8712345678901", barcodeFormat: "EAN-13", price: 9800, quantity: 3, minThreshold: 5, location: "A1-02", createdAt: "2024-01-15T10:00:00Z" },
  { id: "p3", name: "Imprimante HP LaserJet Pro M404dn", description: "Noir et blanc, 38ppm", category: "Imprimante", categoryId: "c2", barcode: "8712345678902", barcodeFormat: "EAN-13", price: 4500, quantity: 8, minThreshold: 3, location: "B2-01", createdAt: "2024-02-01T10:00:00Z" },
  { id: "p4", name: "Imprimante HP Color LaserJet M454dw", description: "Couleur, 28ppm", category: "Imprimante", categoryId: "c2", barcode: "8712345678903", barcodeFormat: "EAN-13", price: 8500, quantity: 4, minThreshold: 2, location: "B2-02", createdAt: "2024-02-01T10:00:00Z" },
  { id: "p5", name: "Scanner Brother ADS-2700W", description: "Document, WiFi, 35ppm", category: "Scanner", categoryId: "c3", barcode: "8712345678904", barcodeFormat: "EAN-13", price: 3200, quantity: 6, minThreshold: 2, location: "C3-01", createdAt: "2024-02-15T10:00:00Z" },
  { id: "p6", name: "Terminal Zebra TC21", description: "Android, 4Go RAM, 64Go", category: "Terminal mobile", categoryId: "c4", barcode: "8712345678905", barcodeFormat: "QR Code", price: 7500, quantity: 2, minThreshold: 5, location: "D4-01", createdAt: "2024-03-01T10:00:00Z" },
  { id: "p7", name: "Terminal Zebra TC26", description: "Android, 4Go RAM, 32Go", category: "Terminal mobile", categoryId: "c4", barcode: "8712345678906", barcodeFormat: "QR Code", price: 6500, quantity: 0, minThreshold: 3, location: "D4-02", createdAt: "2024-03-01T10:00:00Z" },
  { id: "p8", name: "Écran Dell 27\" P2723DE", description: "IPS, 2560x1440, USB-C", category: "Écran", categoryId: "c5", barcode: "8712345678907", barcodeFormat: "EAN-13", price: 4200, quantity: 12, minThreshold: 4, location: "E5-01", createdAt: "2024-03-15T10:00:00Z" },
  { id: "p9", name: "Clavier Logitech MK270", description: "Sans fil, combo souris", category: "Accessoire", categoryId: "c6", barcode: "8712345678908", barcodeFormat: "Code 128", price: 350, quantity: 25, minThreshold: 10, location: "F6-01", createdAt: "2024-04-01T10:00:00Z" },
  { id: "p10", name: "Switch Cisco 48 ports", description: "Gigabit, managed", category: "Réseau", categoryId: "c7", barcode: "8712345678909", barcodeFormat: "Code 128", price: 15000, quantity: 2, minThreshold: 2, location: "G7-01", createdAt: "2024-04-15T10:00:00Z" },
  { id: "p11", name: "Lecteur Zebra RFD8500", description: "RFID, Bluetooth, industrielle", category: "Lecteur code-barres", categoryId: "c8", barcode: "8712345678910", barcodeFormat: "EAN-13", price: 3500, quantity: 4, minThreshold: 1, location: "H8-01", createdAt: "2024-05-01T10:00:00Z" },
  { id: "p12", name: "Câble HDMI 2m", description: "HDMI 2.0, 4K", category: "Accessoire", categoryId: "c6", barcode: "8712345678911", barcodeFormat: "Code 128", price: 80, quantity: 50, minThreshold: 20, location: "F6-02", createdAt: "2024-05-01T10:00:00Z" },
];

const baseMovements: StockMovement[] = [
  { id: "m1", productId: "p1", productName: "PC Portable HP EliteBook 840", productBarcode: "8712345678900", type: "in", reason: "replenishment", quantity: 10, employeeId: "e3", employeeName: "Hicham Tazi", timestamp: "2026-06-10T09:00:00Z", notes: "Réapprovisionnement fournisseur" },
  { id: "m2", productId: "p2", productName: "PC Portable Dell Latitude 5540", productBarcode: "8712345678901", type: "out", reason: "sale", quantity: 2, employeeId: "e1", employeeName: "Karim Benali", timestamp: "2026-06-11T14:30:00Z", notes: "Vente client ABC SARL" },
  { id: "m3", productId: "p6", productName: "Terminal Zebra TC21", productBarcode: "8712345678905", type: "out", reason: "internal_use", quantity: 1, employeeId: "e5", employeeName: "Youssef Hamidi", timestamp: "2026-06-12T10:00:00Z", notes: "Prêt interne équipe technique" },
  { id: "m4", productId: "p3", productName: "Imprimante HP LaserJet Pro M404dn", productBarcode: "8712345678902", type: "out", reason: "sale", quantity: 1, employeeId: "e4", employeeName: "Nadia Ouazzani", timestamp: "2026-06-12T11:00:00Z" },
  { id: "m5", productId: "p7", productName: "Terminal Zebra TC26", productBarcode: "8712345678906", type: "out", reason: "damaged", quantity: 1, employeeId: "e5", employeeName: "Youssef Hamidi", timestamp: "2026-06-13T15:00:00Z", notes: "Écran cassé lors de l'utilisation" },
  { id: "m6", productId: "p9", productName: "Clavier Logitech MK270", productBarcode: "8712345678908", type: "in", reason: "replenishment", quantity: 20, employeeId: "e3", employeeName: "Hicham Tazi", timestamp: "2026-06-13T08:30:00Z" },
  { id: "m7", productId: "p11", productName: "Lecteur Zebra RFD8500", productBarcode: "8712345678910", type: "in", reason: "replenishment", quantity: 2, employeeId: "e3", employeeName: "Hicham Tazi", timestamp: "2026-06-14T09:00:00Z" },
  { id: "m8", productId: "p1", productName: "PC Portable HP EliteBook 840", productBarcode: "8712345678900", type: "out", reason: "sale", quantity: 1, employeeId: "e1", employeeName: "Karim Benali", timestamp: "2026-06-14T10:15:00Z" },
];

export const alerts: Alert[] = [
  { id: "al1", type: "stock_low", message: "Stock critique : Terminal Zebra TC26 (0 unité)", severity: "error", isRead: false, createdAt: "2026-06-14T08:00:00Z", relatedId: "p7" },
  { id: "al2", type: "stock_low", message: "Stock bas : PC Portable Dell Latitude 5540 (3 unités)", severity: "warning", isRead: false, createdAt: "2026-06-13T10:00:00Z", relatedId: "p2" },
  { id: "al3", type: "leave_pending", message: "Demande de congé en attente - Fatima Zahra", severity: "info", isRead: false, createdAt: "2026-06-14T09:00:00Z", relatedId: "l3" },
  { id: "al4", type: "stock_low", message: "Stock bas : Terminal Zebra TC21 (2 unités)", severity: "warning", isRead: false, createdAt: "2026-06-12T14:00:00Z", relatedId: "p6" },
];

export const notifications: Notification[] = [
  { id: "n1", userId: "e1", message: "a pointé à 08:15 (Présent)", isRead: false, createdAt: "2026-06-14T08:15:00Z" },
  { id: "n2", userId: "e2", message: "a pointé à 08:00 (Présent)", isRead: false, createdAt: "2026-06-14T08:00:00Z" },
  { id: "n3", userId: "e4", message: "a pointé à 08:30 (En retard)", isRead: false, createdAt: "2026-06-14T08:30:00Z" },
  { id: "n4", userId: "e7", message: "a pointé à 09:00 (En retard)", isRead: false, createdAt: "2026-06-14T09:00:00Z" },
  { id: "n5", userId: "e6", message: "a soumis une demande de congé (Raison personnelle)", isRead: false, createdAt: "2026-06-14T09:30:00Z" },
  { id: "n6", userId: "e1", message: "a effectué une sortie stock : PC HP EliteBook 840", isRead: false, createdAt: "2026-06-14T10:15:00Z" },
  { id: "n7", userId: "e3", message: "a signalé un stock bas : Dell Latitude 5540 (3 restants)", isRead: true, createdAt: "2026-06-13T10:00:00Z" },
  { id: "n8", userId: "e5", message: "a enregistré un retour matériel : Terminal Zebra TC26", isRead: true, createdAt: "2026-06-13T15:00:00Z" },
  { id: "n9", userId: "e4", message: "a généré un bon de sortie : Imprimante HP LaserJet", isRead: true, createdAt: "2026-06-12T11:00:00Z" },
  { id: "n10", userId: "e3", message: "a réapprovisionné le stock (20x Clavier Logitech)", isRead: false, createdAt: "2026-06-13T08:30:00Z" },
];

// ─── Generated data helpers ───────────────────────────────────────────────
const now = new Date();
const currentYear = now.getFullYear();
const currentMonth = now.getMonth() + 1; // 1-12

function genId(prefix: string, n: number) { return `${prefix}${n}`; }

function rand(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min; }

function randFloat(min: number, max: number, decimals = 2) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

function daysAgo(n: number) {
  const d = new Date(now);
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

function monthsAgo(n: number) {
  const d = new Date(now);
  d.setMonth(d.getMonth() - n);
  return d;
}

const activeEmployees = employees.filter((e) => e.isActive);

// ─── Stock Movements (enriched: more sales from commercial) ───────────────
const movementReasons: Array<{ type: "in" | "out"; reason: MovementReason; who: string[] }> = [
  { type: "in",  reason: "replenishment", who: ["e3"] },
  { type: "out", reason: "sale",          who: ["e1", "e4"] },
  { type: "out", reason: "internal_use",  who: ["e1", "e4", "e5", "e7"] },
  { type: "out", reason: "damaged",       who: ["e5"] },
];

let mid = 100;
const extraMovements: StockMovement[] = [];
for (let i = 0; i < 30; i++) {
  const product = products[rand(0, products.length - 1)];
  const pool = movementReasons.flatMap((m) =>
    m.who.map((eid) => {
      const emp = activeEmployees.find((e) => e.id === eid);
      return { type: m.type, reason: m.reason, employeeId: eid, employeeName: emp ? `${emp.firstName} ${emp.lastName}` : "Inconnu" };
    })
  );
  const pick = pool[rand(0, pool.length - 1)];
  const daysBack = rand(0, 25);
  extraMovements.push({
    id: genId("m", ++mid),
    productId: product.id,
    productName: product.name,
    productBarcode: product.barcode,
    type: pick.type,
    reason: pick.reason,
    quantity: rand(1, pick.reason === "replenishment" ? 50 : 5),
    employeeId: pick.employeeId,
    employeeName: pick.employeeName,
    timestamp: daysAgo(daysBack),
    notes: pick.reason === "sale" ? "Vente client" : undefined,
  });
}

// ─── Certificate Requests (one per active employee, mix of statuses) ───────
const certTypes = ["work", "salary", "tax"] as const;
const certStatuses = ["pending", "generated", "rejected"] as const;
let crid = 100;
const extraCertificates: CertificateRequest[] = activeEmployees.map((emp, idx) => {
  const status = idx === 0 ? "generated" : certStatuses[idx % 3];
  const type = certTypes[idx % 3];
  return {
    id: genId("cr", ++crid),
    employeeId: emp.id,
    employeeName: `${emp.firstName} ${emp.lastName}`,
    type,
    status,
    createdAt: daysAgo(rand(0, 60)),
    documentUrl: status === "generated" ? "#" : undefined,
  };
});

// ─── Pay Slips (6 months, all active employees) ────────────────────────────
let psid = 100;
const extraPaySlips: PaySlip[] = [];
for (let m = 0; m < 6; m++) {
  const date = monthsAgo(m);
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  activeEmployees.forEach((emp) => {
    const base = emp.salary;
    const bonuses = randFloat(base * 0.03, base * 0.15);
    const overtime = emp.departmentId === "d2" || emp.departmentId === "d5"
      ? randFloat(0, base * 0.12)
      : randFloat(0, base * 0.05);
    const cnss = parseFloat((base * 0.0488).toFixed(2));
    const tax = parseFloat((base * 0.15 + bonuses * 0.1).toFixed(2));
    const netSalary = parseFloat((base + bonuses + overtime - cnss - tax).toFixed(2));
    const isCurrentMonth = month === currentMonth && year === currentYear;
    extraPaySlips.push({
      id: genId("ps", ++psid),
      employeeId: emp.id,
      employeeName: `${emp.firstName} ${emp.lastName}`,
      month,
      year,
      baseSalary: base,
      bonuses,
      overtime,
      paidLeave: 0,
      cnss,
      tax,
      netSalary,
      status: isCurrentMonth ? "draft" : "validated",
      generatedAt: isCurrentMonth ? daysAgo(rand(0, 5)) : daysAgo(rand(5, 35)),
    });
  });
}

// ─── Replace static exports with generated data ────────────────────────────
export const certificateRequests: CertificateRequest[] = extraCertificates;
export const paySlips: PaySlip[] = extraPaySlips.sort(
  (a, b) => b.year - a.year || b.month - a.month
);
export const stockMovements: StockMovement[] = [...baseMovements, ...extraMovements].sort(
  (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
);
