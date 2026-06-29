import { useAppStore } from "../../store/appStore";
import { Link } from "react-router";

export default function MagasinierDashboard() {
  const products = useAppStore((s) => s.products);
  const stockMovements = useAppStore((s) => s.stockMovements);

  const today = new Date().toISOString().split("T")[0];
  const todayMovements = stockMovements.filter((m) => m.timestamp.startsWith(today));
  const lowStockProducts = products.filter((p) => p.quantity <= p.minThreshold);
  const outOfStock = products.filter((p) => p.quantity === 0);

  const inCount = todayMovements.filter((m) => m.type === "in").length;
  const outCount = todayMovements.filter((m) => m.type === "out").length;
  const totalValue = products.reduce((sum, p) => sum + p.price * p.quantity, 0);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Tableau de Bord Stock
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Gestion des produits et inventaire
          </p>
        </div>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm">
          <p className="text-sm text-gray-500 dark:text-gray-400">Produits en stock</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{products.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm">
          <p className="text-sm text-gray-500 dark:text-gray-400">Valeur totale</p>
          <p className="text-3xl font-bold text-green-600 mt-1">{totalValue.toLocaleString()} MAD</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm">
          <p className="text-sm text-gray-500 dark:text-gray-400">Mouvements aujourd'hui</p>
          <p className="text-3xl font-bold text-brand-600 mt-1">{todayMovements.length}</p>
          <p className="text-xs text-gray-400">+{inCount} entrées / -{outCount} sorties</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm">
          <p className="text-sm text-gray-500 dark:text-gray-400">Alertes stock</p>
          <p className="text-3xl font-bold text-red-600 mt-1">{lowStockProducts.length}</p>
          <p className="text-xs text-red-400">{outOfStock.length} en rupture</p>
        </div>
      </div>

      {/* Low stock & movements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-5">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">⚠️ Produits en alerte</h2>
          {lowStockProducts.length === 0 ? (
            <p className="text-sm text-gray-500">Aucun stock bas</p>
          ) : (
            <ul className="space-y-2">
              {lowStockProducts.slice(0, 6).map((p) => (
                <li key={p.id} className="flex justify-between items-center text-sm">
                  <div>
                    <span className="text-gray-700 dark:text-gray-300">{p.name}</span>
                    <span className="text-gray-400 ml-2 text-xs">{p.location}</span>
                  </div>
                  <span className={`font-medium ${p.quantity === 0 ? "text-red-600" : "text-amber-600"}`}>
                    {p.quantity} / {p.minThreshold}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-5">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">📋 Derniers mouvements</h2>
          {todayMovements.length === 0 ? (
            <p className="text-sm text-gray-500">Aucun mouvement aujourd'hui</p>
          ) : (
            <ul className="space-y-2">
              {stockMovements.slice(0, 6).map((m) => (
                <li key={m.id} className="flex justify-between text-sm">
                  <div>
                    <span className={`inline-block w-2 h-2 rounded-full mr-2 ${m.type === "in" ? "bg-green-500" : "bg-red-500"}`} />
                    <span className="text-gray-700 dark:text-gray-300">{m.productName}</span>
                  </div>
                  <span className="text-gray-500">
                    {m.type === "in" ? "+" : "-"}{m.quantity} · {m.employeeName}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link to="/products" className="px-4 py-3 bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300 rounded-lg text-sm font-medium hover:bg-brand-100 dark:hover:bg-brand-900/30 transition-colors text-center">
          📦 Produits
        </Link>
        <Link to="/stock-movements" className="px-4 py-3 bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-center">
          📥 Mouvements
        </Link>
        <Link to="/barcode-scan" className="px-4 py-3 bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-center">
          📷 Scan
        </Link>
        <Link to="/categories" className="px-4 py-3 bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-center">
          🏷️ Catégories
        </Link>
      </div>
    </div>
  );
}
