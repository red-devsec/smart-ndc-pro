import { useMemo } from "react";
import { useAppStore } from "../../store/appStore";
import { Link } from "react-router";

export default function ManagerDashboard() {
  const employees = useAppStore((s) => s.employees);
  const products = useAppStore((s) => s.products);
  const attendanceRecords = useAppStore((s) => s.attendanceRecords);
  const leaves = useAppStore((s) => s.leaves);
  const stockMovements = useAppStore((s) => s.stockMovements);

  const stats = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    const todayAttendance = attendanceRecords.filter((a) => a.date === today);
    const activeEmployees = employees.filter((e) => e.isActive);
    const lowStock = products.filter((p) => p.quantity <= p.minThreshold);
    return {
      totalEmployees: activeEmployees.length,
      presentToday: todayAttendance.filter((a) => a.status === "present" || a.status === "late").length,
      absentToday: activeEmployees.length - todayAttendance.filter((a) => a.status === "present" || a.status === "late").length,
      pendingLeaves: leaves.filter((l) => l.status === "pending").length,
      totalProducts: products.length,
      stockAlerts: lowStock.length,
      movementsToday: stockMovements.filter((m) => m.timestamp.startsWith(today)).length,
      lowStockProducts: lowStock.length,
    };
  }, [employees, attendanceRecords, leaves, stockMovements, products]);

  const lowStockProducts = products.filter((p) => p.quantity <= p.minThreshold);
  const totalStockValue = products.reduce((sum, p) => sum + p.price * p.quantity, 0);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Tableau de Bord Manager
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Synthèse RH et Stock
          </p>
        </div>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm">
          <p className="text-sm text-gray-500 dark:text-gray-400">Employés actifs</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{stats.totalEmployees}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm">
          <p className="text-sm text-gray-500 dark:text-gray-400">Présents aujourd'hui</p>
          <p className="text-3xl font-bold text-green-600 mt-1">{stats.presentToday}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm">
          <p className="text-sm text-gray-500 dark:text-gray-400">Valeur du stock</p>
          <p className="text-3xl font-bold text-brand-600 mt-1">{totalStockValue.toLocaleString()} MAD</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm">
          <p className="text-sm text-gray-500 dark:text-gray-400">Alertes stock</p>
          <p className="text-3xl font-bold text-amber-600 mt-1">{lowStockProducts.length}</p>
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-5">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">📦 Produits en alerte</h2>
          {lowStockProducts.length === 0 ? (
            <p className="text-sm text-gray-500">Aucun produit en dessous du seuil</p>
          ) : (
            <ul className="space-y-2">
              {lowStockProducts.map((p) => (
                <li key={p.id} className="flex justify-between text-sm">
                  <span className="text-gray-700 dark:text-gray-300">{p.name}</span>
                  <span className="font-medium text-amber-600">{p.quantity} / {p.minThreshold}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-5">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">📊 Indicateurs</h2>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Congés en attente</span>
              <span className="font-medium text-gray-700 dark:text-gray-300">{stats.pendingLeaves}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Produits total</span>
              <span className="font-medium text-gray-700 dark:text-gray-300">{stats.totalProducts}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Mouvements aujourd'hui</span>
              <span className="font-medium text-gray-700 dark:text-gray-300">{stats.movementsToday}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Absents aujourd'hui</span>
              <span className="font-medium text-gray-700 dark:text-gray-300">{stats.absentToday}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Accès rapides */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link to="/products" className="px-4 py-3 bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300 rounded-lg text-sm font-medium hover:bg-brand-100 dark:hover:bg-brand-900/30 transition-colors text-center">
          📦 Produits
        </Link>
        <Link to="/reports/hr" className="px-4 py-3 bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-center">
          📋 Rapports RH
        </Link>
        <Link to="/reports/inventory" className="px-4 py-3 bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-center">
          📈 Rapports Stock
        </Link>
        <Link to="/reports/combined" className="px-4 py-3 bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-center">
          🔗 Rapports Combinés
        </Link>
      </div>
    </div>
  );
}
