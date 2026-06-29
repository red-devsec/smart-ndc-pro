import { create } from "zustand";
import type {
  User, Employee, RfidCard, Attendance, Leave,
  Product, StockMovement, Alert, Notification,
  CertificateRequest, PaySlip, DashboardStats
} from "../data/types";
import * as mock from "../data/mockData";
import {
  authApi, employeeApi, attendanceApi, leaveApi,
  productApi, movementApi, alertApi, rfidApi,
  certificateApi, payslipApi,
} from "../services/api";

const AUTH_KEY = "smartndc-auth-storage";

interface AuthState {
  currentUser: User | null;
  isAuthenticated: boolean;
  token: string | null;
}

function loadAuth(): AuthState {
  try {
    const stored = localStorage.getItem(AUTH_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed?.version === 3 && parsed?.state) {
        return {
          currentUser: parsed.state.currentUser ?? null,
          isAuthenticated: parsed.state.isAuthenticated ?? false,
          token: parsed.state.token ?? null,
        };
      }
    }
  } catch { /* ignore */ }
  return { currentUser: null, isAuthenticated: false, token: null };
}

function saveAuth(state: AuthState) {
  localStorage.setItem(AUTH_KEY, JSON.stringify({ version: 3, state }));
}

function clearAuth() {
  localStorage.removeItem(AUTH_KEY);
}

interface AppState {
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  loading: boolean;

  employees: Employee[];
  fetchEmployees: () => Promise<void>;
  addEmployee: (e: Partial<Employee>) => Promise<void>;
  updateEmployee: (id: string, data: Partial<Employee>) => Promise<void>;
  deleteEmployee: (id: string) => Promise<void>;

  rfidCards: RfidCard[];
  fetchRfidCards: () => Promise<void>;
  toggleRfidCard: (id: string) => Promise<void>;
  assignRfidCard: (cardId: string, employeeId: string) => Promise<void>;

  attendanceRecords: Attendance[];
  fetchAttendance: () => Promise<void>;
  getTodayAttendance: () => Attendance[];
  getEmployeeAttendance: (employeeId: string) => Attendance[];
  addAttendance: (a: Partial<Attendance>) => Promise<void>;

  leaves: Leave[];
  fetchLeaves: () => Promise<void>;
  addLeave: (l: Partial<Leave>) => Promise<void>;
  updateLeaveStatus: (id: string, status: "approved" | "rejected", reviewedBy: string) => Promise<void>;

  products: Product[];
  categories: typeof mock.categories;
  fetchProducts: () => Promise<void>;
  addProduct: (p: Partial<Product>) => Promise<void>;
  updateProduct: (id: string, data: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;

  stockMovements: StockMovement[];
  fetchMovements: () => Promise<void>;
  addStockMovement: (m: Partial<StockMovement>) => Promise<void>;

  alerts: Alert[];
  notifications: Notification[];
  fetchAlerts: () => Promise<void>;
  markAlertRead: (id: string) => Promise<void>;
  addAlert: (a: Partial<Alert>) => Promise<void>;

  certificateRequests: CertificateRequest[];
  fetchCertificates: () => Promise<void>;
  addCertificateRequest: (cr: Partial<CertificateRequest>) => Promise<void>;
  updateCertificateStatus: (id: string, status: "generated" | "rejected") => Promise<void>;

  paySlips: PaySlip[];
  fetchPaySlips: () => Promise<void>;

  getDashboardStats: () => DashboardStats;
  isEmployeePresentToday: (employeeId: string) => boolean;
}

export const useAppStore = create<AppState>()((set, get) => {
  const initial = loadAuth();
  return {
    ...initial,
    loading: false,

    // ── Auth ──
    login: async (email, password) => {
      try {
        const result = await authApi.login(email, password);
        const state: AuthState = { currentUser: result.user, isAuthenticated: true, token: result.token };
        set({ ...state });
        saveAuth(state);
        return true;
      } catch {
        const user = mock.users.find(u => u.email === email && u.password === password);
        if (user) {
          const state: AuthState = { currentUser: user, isAuthenticated: true, token: "mock-token" };
          set({ ...state });
          saveAuth(state);
          return true;
        }
        return false;
      }
    },

    logout: async () => {
      try { await authApi.logout(); } catch { /* ignore */ }
      set({ currentUser: null, isAuthenticated: false });
      clearAuth();
    },

    // ── Employees ──
    employees: mock.employees,
    fetchEmployees: async () => {
      try { set({ employees: await employeeApi.list() }); } catch { /* keep mock */ }
    },
    addEmployee: async (e) => {
      try { const emp = await employeeApi.create(e); set(s => ({ employees: [...s.employees, emp] })); }
      catch { set(s => ({ employees: [...s.employees, e as Employee] })); }
    },
    updateEmployee: async (id, data) => {
      try { await employeeApi.update(id, data); } catch { /* ignore */ }
      set(s => ({ employees: s.employees.map(e => e.id === id ? { ...e, ...data } : e) }));
    },
    deleteEmployee: async (id) => {
      try { await employeeApi.delete(id); } catch { /* ignore */ }
      set(s => ({ employees: s.employees.filter(e => e.id !== id) }));
    },

    // ── RFID ──
    rfidCards: mock.rfidCards,
    fetchRfidCards: async () => {
      try { set({ rfidCards: await rfidApi.list() }); } catch { /* keep mock */ }
    },
    toggleRfidCard: async (id) => {
      try { await rfidApi.toggle(id); } catch { /* ignore */ }
      set(s => ({ rfidCards: s.rfidCards.map(c => c.id === id ? { ...c, isActive: !c.isActive } : c) }));
    },
    assignRfidCard: async (cardId, employeeId) => {
      try { await rfidApi.assign(cardId, employeeId); } catch { /* ignore */ }
      set(s => {
        const emp = s.employees.find(e => e.id === employeeId);
        return {
          rfidCards: s.rfidCards.map(c =>
            c.id === cardId ? { ...c, employeeId, employeeName: emp?.firstName + " " + emp?.lastName, assignedAt: new Date().toISOString().split("T")[0] } : c
          ),
          employees: s.employees.map(e =>
            e.id === employeeId ? { ...e, rfidCardId: cardId } : e
          ),
        };
      });
    },

    // ── Attendance ──
    attendanceRecords: mock.attendanceRecords,
    fetchAttendance: async () => {
      try { set({ attendanceRecords: await attendanceApi.list() }); } catch { /* keep mock */ }
    },
    getTodayAttendance: () => {
      const today = new Date().toISOString().split("T")[0];
      return get().attendanceRecords.filter(a => a.date === today);
    },
    getEmployeeAttendance: (employeeId) =>
      get().attendanceRecords.filter(a => a.employeeId === employeeId),
    addAttendance: async (a) => {
      set(s => {
        const idx = s.attendanceRecords.findIndex(r => r.id === a.id);
        if (idx >= 0) {
          const updated = [...s.attendanceRecords];
          updated[idx] = { ...updated[idx], ...a } as Attendance;
          return { attendanceRecords: updated };
        }
        return { attendanceRecords: [...s.attendanceRecords, a as Attendance] };
      });
    },

    // ── Leaves ──
    leaves: mock.leaves,
    fetchLeaves: async () => {
      try { set({ leaves: await leaveApi.list() }); } catch { /* keep mock */ }
    },
    addLeave: async (l) => {
      try { const leave = await leaveApi.create(l); set(s => ({ leaves: [...s.leaves, leave] })); }
      catch { set(s => ({ leaves: [...s.leaves, l as Leave] })); }
    },
    updateLeaveStatus: async (id, status, reviewedBy) => {
      try { await leaveApi.updateStatus(id, status, reviewedBy); } catch { /* ignore */ }
      set(s => ({ leaves: s.leaves.map(l => l.id === id ? { ...l, status, reviewedBy } : l) }));
    },

    // ── Products ──
    products: mock.products,
    categories: mock.categories,
    fetchProducts: async () => {
      try { set({ products: await productApi.list() }); } catch { /* keep mock */ }
    },
    addProduct: async (p) => {
      try { const prod = await productApi.create(p); set(s => ({ products: [...s.products, prod] })); }
      catch { set(s => ({ products: [...s.products, p as Product] })); }
    },
    updateProduct: async (id, data) => {
      try { await productApi.update(id, data); } catch { /* ignore */ }
      set(s => ({ products: s.products.map(p => p.id === id ? { ...p, ...data } : p) }));
    },
    deleteProduct: async (id) => {
      try { await productApi.delete(id); } catch { /* ignore */ }
      set(s => ({ products: s.products.filter(p => p.id !== id) }));
    },

    // ── Stock Movements ──
    stockMovements: mock.stockMovements,
    fetchMovements: async () => {
      try { set({ stockMovements: await movementApi.list() }); } catch { /* keep mock */ }
    },
    addStockMovement: async (m) => {
      try { const mov = await movementApi.create(m); set(s => ({ stockMovements: [...s.stockMovements, mov] })); }
      catch {
        set(s => {
          const product = s.products.find(p => p.id === m.productId);
          if (product) {
            const qty = m.quantity ?? 0;
            const newQty = m.type === "in" ? product.quantity + qty : product.quantity - qty;
            return {
              stockMovements: [...s.stockMovements, m as StockMovement],
              products: s.products.map(p =>
                p.id === m.productId ? { ...p, quantity: Math.max(0, newQty) } : p
              ),
            };
          }
          return { stockMovements: [...s.stockMovements, m as StockMovement] };
        });
      }
    },

    // ── Alerts & Notifications ──
    alerts: mock.alerts,
    notifications: mock.notifications,
    fetchAlerts: async () => {
      try { set({ alerts: await alertApi.list() }); } catch { /* keep mock */ }
    },
    markAlertRead: async (id) => {
      try { await alertApi.markRead(id); } catch { /* ignore */ }
      set(s => ({ alerts: s.alerts.map(a => a.id === id ? { ...a, isRead: true } : a) }));
    },
    addAlert: async (a) => {
      try { const alert = await alertApi.create(a); set(s => ({ alerts: [...s.alerts, alert] })); }
      catch { set(s => ({ alerts: [...s.alerts, a as Alert] })); }
    },

    // ── Certificates ──
    certificateRequests: mock.certificateRequests,
    fetchCertificates: async () => {
      try { set({ certificateRequests: await certificateApi.list() }); } catch { /* keep mock */ }
    },
    addCertificateRequest: async (cr) => {
      try { const cert = await certificateApi.create(cr); set(s => ({ certificateRequests: [...s.certificateRequests, cert] })); }
      catch { set(s => ({ certificateRequests: [...s.certificateRequests, cr as CertificateRequest] })); }
    },
    updateCertificateStatus: async (id, status) => {
      try { await certificateApi.updateStatus(id, status); } catch { /* ignore */ }
      set(s => ({ certificateRequests: s.certificateRequests.map(cr => cr.id === id ? { ...cr, status } : cr) }));
    },

    // ── Pay slips ──
    paySlips: mock.paySlips,
    fetchPaySlips: async () => {
      try { set({ paySlips: await payslipApi.list() }); } catch { /* keep mock */ }
    },

    // ── Dashboard ──
    getDashboardStats: () => {
      const state = get();
      const today = new Date().toISOString().split("T")[0];
      const todayAttendance = state.attendanceRecords.filter(a => a.date === today);
      const activeEmployees = state.employees.filter(e => e.isActive);
      const lowStockProducts = state.products.filter(p => p.quantity <= p.minThreshold);

      return {
        totalEmployees: activeEmployees.length,
        presentToday: todayAttendance.filter(a => a.status === "present" || a.status === "late").length,
        absentToday: activeEmployees.length - todayAttendance.filter(a => a.status === "present" || a.status === "late").length,
        pendingLeaves: state.leaves.filter(l => l.status === "pending").length,
        totalProducts: state.products.length,
        stockAlerts: lowStockProducts.length,
        movementsToday: state.stockMovements.filter(m => m.timestamp.startsWith(today)).length,
        lowStockProducts: lowStockProducts.length,
      };
    },

    isEmployeePresentToday: (employeeId) => {
      const today = new Date().toISOString().split("T")[0];
      return get().attendanceRecords.some(
        a => a.employeeId === employeeId && a.date === today && a.checkOut === undefined
      );
    },
  };
});
