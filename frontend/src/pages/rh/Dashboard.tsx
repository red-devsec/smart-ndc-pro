import { useAppStore } from "../../store/appStore";
import { Link } from "react-router";

export default function RHDashboard() {
  const employees = useAppStore((s) => s.employees);
  const leaves = useAppStore((s) => s.leaves);
  const attendanceRecords = useAppStore((s) => s.attendanceRecords);
  const certificates = useAppStore((s) => s.certificateRequests);

  const today = new Date().toISOString().split("T")[0];
  const todayAttendance = attendanceRecords.filter((a) => a.date === today);
  const pendingLeaves = leaves.filter((l) => l.status === "pending");
  const pendingCertificates = certificates.filter((c) => c.status === "pending");
  const activeEmployees = employees.filter((e) => e.isActive);

  const presentCount = todayAttendance.filter(
    (a) => a.status === "present" || a.status === "late"
  ).length;
  const absentCount = activeEmployees.length - presentCount;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Tableau de Bord RH
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Gestion des ressources humaines
          </p>
        </div>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm">
          <p className="text-sm text-gray-500 dark:text-gray-400">Effectif actif</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{activeEmployees.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm">
          <p className="text-sm text-gray-500 dark:text-gray-400">Présents aujourd'hui</p>
          <p className="text-3xl font-bold text-green-600 mt-1">{presentCount}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm">
          <p className="text-sm text-gray-500 dark:text-gray-400">Absents</p>
          <p className="text-3xl font-bold text-red-600 mt-1">{absentCount}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm">
          <p className="text-sm text-gray-500 dark:text-gray-400">Congés en attente</p>
          <p className="text-3xl font-bold text-amber-600 mt-1">{pendingLeaves.length}</p>
        </div>
      </div>

      {/* Actions & Pending */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-5">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">⏳ Congés à valider</h2>
          {pendingLeaves.length === 0 ? (
            <p className="text-sm text-gray-500">Aucune demande en attente</p>
          ) : (
            <ul className="space-y-3">
              {pendingLeaves.slice(0, 5).map((l) => (
                <li key={l.id} className="flex justify-between items-center text-sm">
                  <div>
                    <span className="text-gray-700 dark:text-gray-300 font-medium">{l.employeeName}</span>
                    <span className="text-gray-500 ml-2">{l.type} · {l.startDate} → {l.endDate}</span>
                  </div>
                  <Link to="/leaves" className="text-brand-600 hover:text-brand-700 text-xs font-medium">Traiter</Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-5">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">📄 Attestations en attente</h2>
          {pendingCertificates.length === 0 ? (
            <p className="text-sm text-gray-500">Aucune demande en attente</p>
          ) : (
            <ul className="space-y-3">
              {pendingCertificates.slice(0, 5).map((c) => (
                <li key={c.id} className="flex justify-between items-center text-sm">
                  <div>
                    <span className="text-gray-700 dark:text-gray-300 font-medium">{c.employeeName}</span>
                    <span className="text-gray-500 ml-2">{c.type}</span>
                  </div>
                  <Link to="/certificates" className="text-brand-600 hover:text-brand-700 text-xs font-medium">Traiter</Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link to="/employees" className="px-4 py-3 bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300 rounded-lg text-sm font-medium hover:bg-brand-100 dark:hover:bg-brand-900/30 transition-colors text-center">
          👥 Employés
        </Link>
        <Link to="/attendance" className="px-4 py-3 bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-center">
          🕐 Pointage
        </Link>
        <Link to="/leaves" className="px-4 py-3 bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-center">
          🏖️ Congés
        </Link>
        <Link to="/rfid-cards" className="px-4 py-3 bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-center">
          🪪 Cartes RFID
        </Link>
      </div>
    </div>
  );
}
