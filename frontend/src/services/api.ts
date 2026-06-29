import axios from "axios";
import type {
  User, Employee, RfidCard, Attendance, Leave,
  Product, StockMovement, Alert,
  CertificateRequest, PaySlip, DashboardStats,
} from "../data/types";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

const api = axios.create({ baseURL: API_BASE });

api.interceptors.request.use((config) => {
  const stored = localStorage.getItem("smartndc-auth-storage");
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      const token = parsed?.state?.token;
      if (token) config.headers.Authorization = `Bearer ${token}`;
    } catch { /* ignore */ }
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("smartndc-auth-storage");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

function data<T>(res: { data: { success: boolean; data: T } }): T {
  return res.data.data;
}

// ── Auth ──
export const authApi = {
  login: (email: string, password: string) =>
    api.post("/auth/login", { email, password }).then((r) => r.data.data as { token: string; user: User }),

  me: () => api.get("/auth/me").then(data<User>),

  logout: () => api.post("/auth/logout").then(data<null>),
};

// ── Employees ──
export const employeeApi = {
  list: () => api.get("/employees").then(data<Employee[]>),
  get: (id: string) => api.get(`/employees/${id}`).then(data<Employee>),
  create: (e: Partial<Employee>) => api.post("/employees", e).then(data<Employee>),
  update: (id: string, e: Partial<Employee>) => api.put(`/employees/${id}`, e).then(data<Employee>),
  delete: (id: string) => api.delete(`/employees/${id}`).then(data<null>),
};

// ── Attendance ──
export const attendanceApi = {
  list: () => api.get("/attendance").then(data<Attendance[]>),
  today: () => api.get("/attendance/today").then(data<Attendance[]>),
  byEmployee: (id: string) => api.get(`/attendance/employee/${id}`).then(data<Attendance[]>),
  checkIn: () => api.post("/attendance/checkin").then(data<Attendance>),
  checkOut: (id: string) => api.post(`/attendance/checkout/${id}`).then(data<Attendance>),
};

// ── Leaves ──
export const leaveApi = {
  list: () => api.get("/leaves").then(data<Leave[]>),
  balance: () => api.get("/leaves/balance").then((r) => r.data.data),
  create: (l: Partial<Leave>) => api.post("/leaves", l).then(data<Leave>),
  updateStatus: (id: string, status: string, reviewedBy: string) =>
    api.put(`/leaves/${id}/status`, { status, reviewedBy }).then(data<Leave>),
};

// ── Products ──
export const productApi = {
  list: () => api.get("/products").then(data<Product[]>),
  lowStock: () => api.get("/products/low-stock").then(data<Product[]>),
  byBarcode: (code: string) => api.get(`/products/barcode/${code}`).then(data<Product>),
  get: (id: string) => api.get(`/products/${id}`).then(data<Product>),
  create: (p: Partial<Product>) => api.post("/products", p).then(data<Product>),
  update: (id: string, p: Partial<Product>) => api.put(`/products/${id}`, p).then(data<Product>),
  delete: (id: string) => api.delete(`/products/${id}`).then(data<null>),
};

// ── Stock Movements ──
export const movementApi = {
  list: () => api.get("/movements").then(data<StockMovement[]>),
  byProduct: (id: string) => api.get(`/movements/product/${id}`).then(data<StockMovement[]>),
  byEmployee: (id: string) => api.get(`/movements/employee/${id}`).then(data<StockMovement[]>),
  create: (m: Partial<StockMovement>) => api.post("/movements", m).then(data<StockMovement>),
};

// ── Alerts ──
export const alertApi = {
  list: () => api.get("/alerts").then(data<Alert[]>),
  markRead: (id: string) => api.put(`/alerts/${id}/read`).then(data<Alert>),
  create: (a: Partial<Alert>) => api.post("/alerts", a).then(data<Alert>),
};

// ── RFID ──
export const rfidApi = {
  list: () => api.get("/rfid").then(data<RfidCard[]>),
  create: (r: Partial<RfidCard>) => api.post("/rfid", r).then(data<RfidCard>),
  assign: (cardId: string, employeeId: string) =>
    api.post("/rfid/assign", { cardId, employeeId }).then(data<RfidCard>),
  toggle: (id: string) => api.put(`/rfid/${id}/toggle`).then(data<RfidCard>),
};

// ── Certificates ──
export const certificateApi = {
  list: () => api.get("/certificates").then(data<CertificateRequest[]>),
  my: () => api.get("/certificates/my").then(data<CertificateRequest[]>),
  create: (c: Partial<CertificateRequest>) => api.post("/certificates", c).then(data<CertificateRequest>),
  updateStatus: (id: string, status: string) =>
    api.put(`/certificates/${id}/status`, { status }).then(data<CertificateRequest>),
};

// ── Pay Slips ──
// ── Uploads ──
export const uploadApi = {
  employeePhoto: (file: File) => {
    const fd = new FormData();
    fd.append("photo", file);
    return api.post("/uploads/employee-photo", fd).then((r) => r.data.data as { key: string; url: string });
  },
  file: (file: File, prefix?: string) => {
    const fd = new FormData();
    fd.append("file", file);
    if (prefix) fd.append("prefix", prefix);
    return api.post("/uploads", fd).then((r) => r.data.data as { key: string; url: string; filename: string });
  },
};

export const payslipApi = {
  list: () => api.get("/payslips").then(data<PaySlip[]>),
  my: () => api.get("/payslips/my").then(data<PaySlip[]>),
  generate: (month?: number, year?: number) =>
    api.post("/payslips/generate", { month, year }).then(data<PaySlip[]>),
  validate: (id: string) => api.put(`/payslips/${id}/validate`).then(data<PaySlip>),
};

// ── Dashboard ──
export const dashboardApi = {
  stats: () => api.get("/dashboard").then(data<DashboardStats>),
  adminStats: () => api.get("/admin/stats").then(data<any>),
  exportPdf: () => api.get("/dashboard/export").then<{ url: string }>(data),
};

export default api;
