import { useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { useAppStore } from "../../store/appStore";
import Input from "../../components/form/input/InputField";

type FilterTab = "today" | "week" | "month";

function generateId() {
  return `a${Date.now()}`;
}

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

function getWeekId(dateStr: string) {
  const d = new Date(dateStr);
  const start = new Date(d);
  start.setDate(d.getDate() - d.getDay());
  return start.toISOString().split("T")[0];
}

function getMonthId(dateStr: string) {
  return dateStr.slice(0, 7);
}

export default function AttendancePage() {
  const { employees, attendanceRecords, rfidCards, addAttendance } = useAppStore();
  const [filterTab, setFilterTab] = useState<FilterTab>("today");
  const [rfidUid, setRfidUid] = useState("");
  const [scanMessage, setScanMessage] = useState("");
  const [isScanning, setIsScanning] = useState(false);

  const today = new Date().toISOString().split("T")[0];
  const todayStr = today;

  const filteredRecords = attendanceRecords.filter((a) => {
    if (filterTab === "today") return a.date === todayStr;
    if (filterTab === "week") return getWeekId(a.date) === getWeekId(todayStr);
    if (filterTab === "month") return getMonthId(a.date) === getMonthId(todayStr);
    return true;
  });

  const handleScan = () => {
    if (!rfidUid.trim()) return;
    setIsScanning(true);
    setScanMessage("Recherche de la carte...");

    setTimeout(() => {
      const card = rfidCards.find(
        (c) => c.uid.toUpperCase() === rfidUid.trim().toUpperCase() && c.isActive
      );

      if (!card) {
        setScanMessage("Carte non trouvée ou désactivée.");
        setIsScanning(false);
        return;
      }

      const emp = employees.find((e) => e.id === card.employeeId);

      if (!emp) {
        setScanMessage("Aucun employé associé à cette carte.");
        setIsScanning(false);
        return;
      }

      const alreadyCheckedIn = attendanceRecords.some(
        (a) => a.employeeId === emp.id && a.date === todayStr && !a.checkOut
      );

      const now = new Date();
      const timeStr = now.toISOString();
      const hour = now.getHours();

      if (alreadyCheckedIn) {
        const existing = attendanceRecords.find(
          (a) => a.employeeId === emp.id && a.date === todayStr && !a.checkOut
        );
        if (existing) {
          const checkInTime = new Date(existing.checkIn);
          const hoursWorked = (now.getTime() - checkInTime.getTime()) / 3600000;
          addAttendance({
            ...existing,
            checkOut: timeStr,
            hoursWorked: Math.round(hoursWorked * 100) / 100,
          });
          setScanMessage(`Pointage sortie: ${emp.firstName} ${emp.lastName} - ${formatTime(timeStr)}`);
        }
      } else {
        const status = hour <= 9 ? "present" : "late";
        addAttendance({
          id: generateId(),
          employeeId: emp.id,
          employeeName: `${emp.firstName} ${emp.lastName}`,
          checkIn: timeStr,
          checkOut: undefined,
          hoursWorked: undefined,
          date: todayStr,
          location: "office",
          status,
        });
        setScanMessage(`Pointage entrée: ${emp.firstName} ${emp.lastName} - ${formatTime(timeStr)}`);
      }

      setRfidUid("");
      setIsScanning(false);
    }, 1500);
  };

  const tabs: { key: FilterTab; label: string }[] = [
    { key: "today", label: "Aujourd'hui" },
    { key: "week", label: "Cette semaine" },
    { key: "month", label: "Ce mois" },
  ];

  return (
    <>
      <PageMeta
        title="Pointage - SMART NDC"
        description="Gestion des pointages et présence"
      />
      <PageBreadcrumb pageTitle="Pointage" />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2 space-y-6">
          <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="px-5 py-5 sm:px-7">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex gap-1 rounded-lg bg-gray-100 p-0.5 dark:bg-gray-900">
                  {tabs.map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setFilterTab(tab.key)}
                      className={`rounded-md px-5 py-2 text-sm font-medium transition ${
                        filterTab === tab.key
                          ? "bg-white text-gray-900 shadow-theme-xs dark:bg-gray-800 dark:text-white"
                          : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
                <button className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-5 py-3.5 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03]">
                  Exporter
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-t border-gray-100 bg-gray-50 dark:border-gray-800 dark:bg-white/[0.03]">
                    <th className="px-5 py-4 text-left text-xs font-medium text-gray-500 uppercase">Employé</th>
                    <th className="px-5 py-4 text-left text-xs font-medium text-gray-500 uppercase">Entrée</th>
                    <th className="px-5 py-4 text-left text-xs font-medium text-gray-500 uppercase">Sortie</th>
                    <th className="px-5 py-4 text-left text-xs font-medium text-gray-500 uppercase">Heures</th>
                    <th className="px-5 py-4 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.map((rec) => (
                    <tr key={rec.id} className="border-t border-gray-100 dark:border-gray-800">
                      <td className="px-5 py-4 text-sm font-medium text-gray-800 dark:text-white/90">
                        {rec.employeeName}
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {rec.checkIn ? formatTime(rec.checkIn) : "-"}
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {rec.checkOut ? formatTime(rec.checkOut) : "En cours"}
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {rec.hoursWorked != null ? `${rec.hoursWorked.toFixed(2)}h` : "-"}
                      </td>
                      <td className="px-5 py-4">
                        {rec.status === "present" && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-success-50 px-2.5 py-0.5 text-xs font-medium text-success-600 dark:bg-success-500/15 dark:text-success-500">
                            Présent
                          </span>
                        )}
                        {rec.status === "late" && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-warning-50 px-2.5 py-0.5 text-xs font-medium text-warning-600 dark:bg-warning-500/15 dark:text-orange-400">
                            Retard
                          </span>
                        )}
                        {rec.status === "absent" && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-error-50 px-2.5 py-0.5 text-xs font-medium text-error-600 dark:bg-error-500/15 dark:text-error-500">
                            Absent
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {filteredRecords.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-5 py-12 text-center text-sm text-gray-400">
                        Aucun pointage pour cette période
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="px-5 py-5 sm:px-7">
              <h3 className="mb-4 text-base font-medium text-gray-800 dark:text-white/90">
                Lecteur RFID
              </h3>
              <div className="mb-4 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-brand-200 bg-brand-25 p-6 text-center dark:border-brand-500/30 dark:bg-brand-500/5">
                <div className={`mb-3 flex size-14 items-center justify-center rounded-full ${isScanning ? "bg-warning-100 text-warning-600 animate-pulse dark:bg-warning-500/20" : "bg-brand-50 text-brand-500 dark:bg-brand-500/15"}`}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 10V8C4 6.89543 4.89543 6 6 6H8M4 14V16C4 17.1046 4.89543 18 6 18H8M20 10V8C20 6.89543 19.1046 6 18 6H16M20 14V16C20 17.1046 19.1046 18 18 18H16M9 12H15M12 9V15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {isScanning ? scanMessage : "Passage badge RFID en cours..."}
                </p>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Approchez le badge du lecteur ou saisissez l'UID manuellement
                </p>
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-400">
                  Saisie manuelle UID
                </label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Input
                      placeholder="Ex: A1:B2:C3:D4"
                      value={rfidUid}
                      onChange={(e) => setRfidUid(e.target.value)}
                    />
                  </div>
                  <button
                    onClick={handleScan}
                    disabled={isScanning || !rfidUid.trim()}
                    className="inline-flex items-center justify-center rounded-lg bg-brand-500 px-4 py-3.5 text-sm font-medium text-white shadow-theme-xs hover:bg-brand-600 disabled:bg-brand-300 disabled:cursor-not-allowed"
                  >
                    Valider
                  </button>
                </div>
                {scanMessage && !isScanning && (
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{scanMessage}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
