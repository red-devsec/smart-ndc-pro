import { useAppStore } from "../../store/appStore";
import { Link } from "react-router";

export default function EmployeeDashboard() {
  const currentUser = useAppStore((s) => s.currentUser);
  const leaves = useAppStore((s) => s.leaves);
  const attendanceRecords = useAppStore((s) => s.attendanceRecords);
  const paySlips = useAppStore((s) => s.paySlips);
  const certificates = useAppStore((s) => s.certificateRequests);
  const employees = useAppStore((s) => s.employees);

  // Find employee matching current user
  const myEmployee = employees.find(
    (e) => e.email === currentUser?.email
  );
  const myLeaves = leaves.filter(
    (l) => l.employeeId === myEmployee?.id
  );
  const myAttendance = attendanceRecords.filter(
    (a) => a.employeeId === myEmployee?.id
  );
  const myPaySlips = paySlips.filter(
    (ps) => ps.employeeId === myEmployee?.id
  );
  const myCertificates = certificates.filter(
    (c) => c.employeeId === myEmployee?.id
  );
  const myPendingLeaves = myLeaves.filter((l) => l.status === "pending");
  const pendingCertificates = myCertificates.filter((c) => c.status === "pending");

  const todayRecord = myAttendance.find(
    (a) => a.date === new Date().toISOString().split("T")[0]
  );

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Mon Espace
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Bienvenue, {currentUser?.name || "Employé"}
          </p>
        </div>
      </div>

      {/* Status card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center text-2xl">
            👤
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{myEmployee?.firstName} {myEmployee?.lastName}</h2>
            <p className="text-sm text-gray-500">{myEmployee?.position}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className={`inline-block w-2 h-2 rounded-full ${todayRecord ? "bg-green-500" : "bg-gray-400"}`} />
              <span className="text-xs text-gray-500">
                {todayRecord
                  ? `Pointé aujourd'hui à ${new Date(todayRecord.checkIn).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`
                  : "Non pointé aujourd'hui"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm">
          <p className="text-sm text-gray-500 dark:text-gray-400">Mes congés</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{myLeaves.length}</p>
          <p className="text-xs text-amber-600">{myPendingLeaves.length} en attente</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm">
          <p className="text-sm text-gray-500 dark:text-gray-400">Mes bulletins</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{myPaySlips.length}</p>
          <p className="text-xs text-green-600">{myPaySlips.filter((ps) => ps.status === "validated").length} validés</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm">
          <p className="text-sm text-gray-500 dark:text-gray-400">Mes attestations</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{myCertificates.length}</p>
          <p className="text-xs text-amber-600">{pendingCertificates.length} en attente</p>
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Link to="/leaves" className="px-4 py-4 bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300 rounded-xl text-sm font-medium hover:bg-brand-100 dark:hover:bg-brand-900/30 transition-colors text-center">
          🏖️ Demander un congé
        </Link>
        <Link to="/certificates" className="px-4 py-4 bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-center">
          📄 Demander une attestation
        </Link>
        <Link to="/payslips" className="px-4 py-4 bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-center">
          💰 Voir mes bulletins
        </Link>
      </div>
    </div>
  );
}
