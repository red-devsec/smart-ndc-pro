export type UserRole = "ADMIN" | "MANAGER" | "RH" | "MAGASINIER" | "EMPLOYE";

export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  role: UserRole;
  avatar?: string;
  employeeId?: string;
}

export interface Department {
  id: string;
  name: string;
}

export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  position: string;
  departmentId: string;
  departmentName: string;
  hireDate: string;
  salary: number;
  rfidCardId?: string;
  cardUid?: string;
  photo?: string;
  isActive: boolean;
  createdAt: string;
}

export interface RfidCard {
  id: string;
  uid: string;
  employeeId?: string;
  employeeName?: string;
  isActive: boolean;
  assignedAt?: string;
}

export interface Attendance {
  id: string;
  employeeId: string;
  employeeName: string;
  checkIn: string;
  checkOut?: string;
  hoursWorked?: number;
  date: string;
  location: "office" | "warehouse";
  status: "present" | "late" | "absent";
}

export interface Leave {
  id: string;
  employeeId: string;
  employeeName: string;
  type: "annual" | "sick" | "personal" | "maternity";
  startDate: string;
  endDate: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
  document?: string;
  createdAt: string;
  reviewedBy?: string;
}

export interface ProductCategory {
  id: string;
  name: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  categoryId: string;
  barcode: string;
  barcodeFormat: "EAN-13" | "Code 128" | "QR Code";
  price: number;
  quantity: number;
  minThreshold: number;
  location: string;
  image?: string;
  createdAt: string;
}

export type MovementType = "in" | "out";
export type MovementReason = "replenishment" | "sale" | "internal_use" | "damaged";

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  productBarcode: string;
  type: MovementType;
  reason: MovementReason;
  quantity: number;
  employeeId: string;
  employeeName: string;
  timestamp: string;
  notes?: string;
}

export interface Alert {
  id: string;
  type: "stock_low" | "unauthorized_rfid" | "absent_stock_out" | "leave_pending" | "system";
  message: string;
  severity: "info" | "warning" | "error";
  isRead: boolean;
  createdAt: string;
  relatedId?: string;
}

export interface Notification {
  id: string;
  userId: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface CertificateRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  type: "work" | "salary" | "tax";
  status: "pending" | "generated" | "rejected";
  createdAt: string;
  documentUrl?: string;
}

export interface PaySlip {
  id: string;
  employeeId: string;
  employeeName: string;
  month: number;
  year: number;
  baseSalary: number;
  bonuses: number;
  overtime: number;
  paidLeave: number;
  cnss: number;
  tax: number;
  netSalary: number;
  status: "draft" | "validated";
  generatedAt: string;
}

export interface DashboardStats {
  totalEmployees: number;
  presentToday: number;
  absentToday: number;
  pendingLeaves: number;
  totalProducts: number;
  stockAlerts: number;
  movementsToday: number;
  lowStockProducts: number;
}
