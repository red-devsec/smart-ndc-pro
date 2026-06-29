import { useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import Button from "../../components/ui/button/Button";
import { useAppStore } from "../../store/appStore";

export default function HRReports() {
  const employees = useAppStore((s) => s.employees);
  const attendanceRecords = useAppStore((s) => s.attendanceRecords);
  const leaves = useAppStore((s) => s.leaves);

  const [exportStart, setExportStart] = useState("");
  const [exportEnd, setExportEnd] = useState("");
  const [reportMonth, setReportMonth] = useState("5");
  const [reportYear, setReportYear] = useState("2026");
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [individualMonth, setIndividualMonth] = useState("5");
  const [individualYear, setIndividualYear] = useState("2026");
  const [toast, setToast] = useState("");

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const activeEmployees = employees.filter((e) => e.isActive);

  const filteredAttendance = attendanceRecords.filter((a) => {
    if (!exportStart || !exportEnd) return true;
    return a.date >= exportStart && a.date <= exportEnd;
  });

  const monthlyLeaves = leaves.filter((l) => {
    const d = new Date(l.startDate);
    return (
      d.getMonth() === parseInt(reportMonth) &&
      d.getFullYear() === parseInt(reportYear)
    );
  });

  const individualRecords = attendanceRecords.filter((a) => {
    if (!selectedEmployee) return false;
    const d = new Date(a.date);
    return (
      a.employeeId === selectedEmployee &&
      d.getMonth() === parseInt(individualMonth) &&
      d.getFullYear() === parseInt(individualYear)
    );
  });

  const employeeName = selectedEmployee
    ? employees.find((e) => e.id === selectedEmployee)?.firstName +
      " " +
      employees.find((e) => e.id === selectedEmployee)?.lastName
    : "";
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  void employeeName;

  const handleExport = () => {
    showToast("Fichier exporté avec succès !");
  };

  const handleGenerateReport = () => {
    showToast("Rapport mensuel généré !");
  };

  const handleExportPDF = () => {
    showToast("Fiche individuelle exportée en PDF !");
  };

  return (
    <>
      <PageMeta
        title="Rapports RH - SMART NDC"
        description="Rapports RH et export de données"
      />

      <div className="mb-6">
        <h1 className="text-title-md font-bold text-gray-800 dark:text-white/90">
          Rapports RH
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Export et génération de rapports RH
        </p>
      </div>

      {toast && (
        <div className="mb-4 rounded-lg bg-success-50 px-4 py-3 text-sm text-success-700 dark:bg-success-500/15 dark:text-success-500">
          {toast}
        </div>
      )}

      <div className="space-y-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <h3 className="mb-4 text-base font-medium text-gray-800 dark:text-white/90">
            Export Pointages Excel
          </h3>
          <div className="mb-4 flex flex-wrap items-end gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Date début
              </label>
              <input
                type="date"
                value={exportStart}
                onChange={(e) => setExportStart(e.target.value)}
                className="rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:text-white/90"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Date fin
              </label>
              <input
                type="date"
                value={exportEnd}
                onChange={(e) => setExportEnd(e.target.value)}
                className="rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:text-white/90"
              />
            </div>
            <Button onClick={handleExport}>Exporter</Button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="px-4 py-3 text-left text-theme-xs font-medium text-gray-500 uppercase">
                    Employé
                  </th>
                  <th className="px-4 py-3 text-left text-theme-xs font-medium text-gray-500 uppercase">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-theme-xs font-medium text-gray-500 uppercase">
                    Entrée
                  </th>
                  <th className="px-4 py-3 text-left text-theme-xs font-medium text-gray-500 uppercase">
                    Sortie
                  </th>
                  <th className="px-4 py-3 text-left text-theme-xs font-medium text-gray-500 uppercase">
                    Statut
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredAttendance.map((a) => (
                  <tr
                    key={a.id}
                    className="border-b border-gray-100 dark:border-gray-800"
                  >
                    <td className="px-4 py-3 text-sm text-gray-800 dark:text-white/90">
                      {a.employeeName}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {new Date(a.date).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {new Date(a.checkIn).toLocaleTimeString("fr-FR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {a.checkOut
                        ? new Date(a.checkOut).toLocaleTimeString("fr-FR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "-"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-theme-xs font-medium ${
                          a.status === "present"
                            ? "bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-500"
                            : a.status === "late"
                              ? "bg-warning-50 text-warning-600 dark:bg-warning-500/15 dark:text-orange-400"
                              : "bg-error-50 text-error-600 dark:bg-error-500/15 dark:text-error-500"
                        }`}
                      >
                        {a.status === "present"
                          ? "Présent"
                          : a.status === "late"
                            ? "Retard"
                            : "Absent"}
                      </span>
                    </td>
                  </tr>
                ))}
                {filteredAttendance.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-6 text-center text-sm text-gray-400"
                    >
                      Aucun enregistrement
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <h3 className="mb-4 text-base font-medium text-gray-800 dark:text-white/90">
            Rapport Mensuel Absences
          </h3>
          <div className="mb-4 flex flex-wrap items-end gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Mois
              </label>
              <select
                value={reportMonth}
                onChange={(e) => setReportMonth(e.target.value)}
                className="rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:text-white/90"
              >
                {[
                  "Janvier",
                  "Février",
                  "Mars",
                  "Avril",
                  "Mai",
                  "Juin",
                  "Juillet",
                  "Août",
                  "Septembre",
                  "Octobre",
                  "Novembre",
                  "Décembre",
                ].map((name, i) => (
                  <option key={i} value={i}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Année
              </label>
              <select
                value={reportYear}
                onChange={(e) => setReportYear(e.target.value)}
                className="rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:text-white/90"
              >
                {[2024, 2025, 2026, 2027].map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
            <Button onClick={handleGenerateReport}>Générer</Button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="px-4 py-3 text-left text-theme-xs font-medium text-gray-500 uppercase">
                    Employé
                  </th>
                  <th className="px-4 py-3 text-left text-theme-xs font-medium text-gray-500 uppercase">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left text-theme-xs font-medium text-gray-500 uppercase">
                    Début
                  </th>
                  <th className="px-4 py-3 text-left text-theme-xs font-medium text-gray-500 uppercase">
                    Fin
                  </th>
                  <th className="px-4 py-3 text-left text-theme-xs font-medium text-gray-500 uppercase">
                    Statut
                  </th>
                </tr>
              </thead>
              <tbody>
                {monthlyLeaves.map((l) => (
                  <tr
                    key={l.id}
                    className="border-b border-gray-100 dark:border-gray-800"
                  >
                    <td className="px-4 py-3 text-sm text-gray-800 dark:text-white/90">
                      {l.employeeName}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {l.type === "annual"
                        ? "Annuel"
                        : l.type === "sick"
                          ? "Maladie"
                          : l.type === "personal"
                            ? "Personnel"
                            : "Maternité"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {new Date(l.startDate).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {new Date(l.endDate).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-theme-xs font-medium ${
                          l.status === "approved"
                            ? "bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-500"
                            : l.status === "pending"
                              ? "bg-warning-50 text-warning-600 dark:bg-warning-500/15 dark:text-orange-400"
                              : "bg-error-50 text-error-600 dark:bg-error-500/15 dark:text-error-500"
                        }`}
                      >
                        {l.status === "approved"
                          ? "Approuvé"
                          : l.status === "pending"
                            ? "En attente"
                            : "Rejeté"}
                      </span>
                    </td>
                  </tr>
                ))}
                {monthlyLeaves.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-6 text-center text-sm text-gray-400"
                    >
                      Aucune absence pour cette période
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <h3 className="mb-4 text-base font-medium text-gray-800 dark:text-white/90">
            Fiche Individuelle de Présence
          </h3>
          <div className="mb-4 flex flex-wrap items-end gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Employé
              </label>
              <select
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
                className="rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:text-white/90"
              >
                <option value="">Sélectionner...</option>
                {activeEmployees.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.firstName} {e.lastName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Mois
              </label>
              <select
                value={individualMonth}
                onChange={(e) => setIndividualMonth(e.target.value)}
                className="rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:text-white/90"
              >
                {[
                  "Janvier",
                  "Février",
                  "Mars",
                  "Avril",
                  "Mai",
                  "Juin",
                  "Juillet",
                  "Août",
                  "Septembre",
                  "Octobre",
                  "Novembre",
                  "Décembre",
                ].map((name, i) => (
                  <option key={i} value={i}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Année
              </label>
              <select
                value={individualYear}
                onChange={(e) => setIndividualYear(e.target.value)}
                className="rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:text-white/90"
              >
                {[2024, 2025, 2026, 2027].map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
            <Button onClick={handleExportPDF}>Exporter PDF</Button>
          </div>

          {selectedEmployee && (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="px-4 py-3 text-left text-theme-xs font-medium text-gray-500 uppercase">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left text-theme-xs font-medium text-gray-500 uppercase">
                      Entrée
                    </th>
                    <th className="px-4 py-3 text-left text-theme-xs font-medium text-gray-500 uppercase">
                      Sortie
                    </th>
                    <th className="px-4 py-3 text-left text-theme-xs font-medium text-gray-500 uppercase">
                      Heures
                    </th>
                    <th className="px-4 py-3 text-left text-theme-xs font-medium text-gray-500 uppercase">
                      Statut
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {individualRecords.map((a) => (
                    <tr
                      key={a.id}
                      className="border-b border-gray-100 dark:border-gray-800"
                    >
                      <td className="px-4 py-3 text-sm text-gray-800 dark:text-white/90">
                        {new Date(a.date).toLocaleDateString("fr-FR")}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {new Date(a.checkIn).toLocaleTimeString("fr-FR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {a.checkOut
                          ? new Date(a.checkOut).toLocaleTimeString("fr-FR", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "-"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {a.hoursWorked ? `${a.hoursWorked}h` : "-"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-theme-xs font-medium ${
                            a.status === "present"
                              ? "bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-500"
                              : a.status === "late"
                                ? "bg-warning-50 text-warning-600 dark:bg-warning-500/15 dark:text-orange-400"
                                : "bg-error-50 text-error-600 dark:bg-error-500/15 dark:text-error-500"
                          }`}
                        >
                          {a.status === "present"
                            ? "Présent"
                            : a.status === "late"
                              ? "Retard"
                              : "Absent"}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {individualRecords.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-4 py-6 text-center text-sm text-gray-400"
                      >
                        Aucune donnée pour cet employé
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
