import { useMemo } from "react";
import { useAppStore } from "../../store/appStore";
import { Link } from "react-router";

export default function AdminDashboard() {
  const employees = useAppStore((s) => s.employees);
  const alerts = useAppStore((s) => s.alerts);
  const notifications = useAppStore((s) => s.notifications);
  const products = useAppStore((s) => s.products);
  const attendanceRecords = useAppStore((s) => s.attendanceRecords);
  const leaves = useAppStore((s) => s.leaves);
  const stockMovements = useAppStore((s) => s.stockMovements);

  const stats = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    const todayAttendance = attendanceRecords.filter((a) => a.date === today);
    const activeEmployees = employees.filter((e) => e.isActive);
    const lowStockProducts = products.filter((p) => p.quantity <= p.minThreshold);
    return {
      totalEmployees: activeEmployees.length,
      presentToday: todayAttendance.filter((a) => a.status === "present" || a.status === "late").length,
      absentToday: activeEmployees.length - todayAttendance.filter((a) => a.status === "present" || a.status === "late").length,
      pendingLeaves: leaves.filter((l) => l.status === "pending").length,
      totalProducts: products.length,
      stockAlerts: lowStockProducts.length,
      movementsToday: stockMovements.filter((m) => m.timestamp.startsWith(today)).length,
      lowStockProducts: lowStockProducts.length,
    };
  }, [employees, attendanceRecords, leaves, stockMovements, products]);

  const unreadAlerts = alerts.filter((a) => !a.isRead).length;
  const unreadNotifs = notifications.filter((n) => !n.isRead).length;
  const totalUsers = employees.length;
  const totalProducts = products.length;
  const lowStockProducts = products.filter((p) => p.quantity <= p.minThreshold);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Administration
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Supervision et configuration du système
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm">
          <p className="text-sm text-gray-500 dark:text-gray-400">Employés</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{totalUsers}</p>
          <p className="text-xs text-green-600 mt-1">{stats.presentToday} présents aujourd'hui</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm">
          <p className="text-sm text-gray-500 dark:text-gray-400">Produits</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{totalProducts}</p>
          <p className="text-xs text-amber-600 mt-1">{lowStockProducts.length} en stock bas</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm">
          <p className="text-sm text-gray-500 dark:text-gray-400">Alertes</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{unreadAlerts}</p>
          <p className="text-xs text-red-600 mt-1">non lues</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm">
          <p className="text-sm text-gray-500 dark:text-gray-400">Notifications</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{unreadNotifs}</p>
          <p className="text-xs text-blue-600 mt-1">non lues</p>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-5">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Actions rapides</h2>
          <div className="grid grid-cols-2 gap-3">
            <Link to="/users" className="px-4 py-3 bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300 rounded-lg text-sm font-medium hover:bg-brand-100 dark:hover:bg-brand-900/30 transition-colors text-center">
              👥 Utilisateurs
            </Link>
            <Link to="/settings" className="px-4 py-3 bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-center">
              ⚙️ Configuration
            </Link>
            <Link to="/employees" className="px-4 py-3 bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-center">
              📋 Employés
            </Link>
            <Link to="/products" className="px-4 py-3 bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-center">
              📦 Produits
            </Link>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-5">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">⚠️ Stocks critiques</h2>
          {lowStockProducts.length === 0 ? (
            <p className="text-sm text-gray-500">Aucun stock bas</p>
          ) : (
            <ul className="space-y-2">
              {lowStockProducts.slice(0, 5).map((p) => (
                <li key={p.id} className="flex justify-between items-center text-sm">
                  <span className="text-gray-700 dark:text-gray-300">{p.name}</span>
                  <span className={`font-medium ${p.quantity === 0 ? "text-red-600" : "text-amber-600"}`}>
                    {p.quantity} / {p.minThreshold}
                  </span>
                </li>
              ))}
            </ul>
          )}
          <Link to="/products" className="mt-4 inline-block text-sm text-brand-600 hover:text-brand-700 font-medium">
            Voir tous les produits →
          </Link>
        </div>
      </div>

      {/* System Info */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-5">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">🖥️ Services système</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { name: "Base de données", status: "✅", desc: "PostgreSQL 15" },
            { name: "Stockage MinIO", status: "✅", desc: "Objets / Uploads" },
            { name: "Cache Redis", status: "✅", desc: "Sessions / Cache" },
            { name: "Messagerie", status: "✅", desc: "RabbitMQ" },
            { name: "WebSocket", status: "✅", desc: "Socket.io" },
            { name: "API REST", status: "✅", desc: "Express.js" },
            { name: "Frontend", status: "✅", desc: "React 19" },
            { name: "Mobile", status: "✅", desc: "Expo / React Native" },
          ].map((svc) => (
            <div key={svc.name} className="p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
              <div className="flex items-center gap-2">
                <span>{svc.status}</span>
                <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{svc.name}</span>
              </div>
              <p className="text-xs text-gray-500 mt-1 ml-6">{svc.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
