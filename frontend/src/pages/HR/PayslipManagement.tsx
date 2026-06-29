import { useState, useEffect } from "react";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { useAppStore } from "../../store/appStore";
import { payslipApi } from "../../services/api";
import Select from "../../components/form/Select";
import { PlusIcon } from "../../icons";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "MAD", maximumFractionDigits: 0 }).format(amount);
}

const monthNamesFr = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

const monthOptions = Array.from({ length: 12 }, (_, i) => ({
  value: String(i + 1),
  label: monthNamesFr[i],
}));

const yearOptions = Array.from({ length: 5 }, (_, i) => {
  const y = new Date().getFullYear() - 2 + i;
  return { value: String(y), label: String(y) };
});

export default function PayslipManagement() {
  const { employees, paySlips, fetchPaySlips } = useAppStore();
  const [selectedMonth, setSelectedMonth] = useState(String(new Date().getMonth() + 1));
  const [selectedYear, setSelectedYear] = useState(String(new Date().getFullYear()));

  useEffect(() => { fetchPaySlips(); }, []);

  const handleGenerate = async () => {
    try {
      await payslipApi.generate(Number(selectedMonth), Number(selectedYear));
      await fetchPaySlips();
    } catch (err) {
      console.error("Erreur génération bulletins:", err);
    }
  };

  const handleValidate = async (id: string) => {
    try {
      await payslipApi.validate(id);
      await fetchPaySlips();
    } catch (err) {
      console.error("Erreur validation bulletin:", err);
    }
  };

  const filtered = paySlips.filter((ps) =>
    ps.month === Number(selectedMonth) && ps.year === Number(selectedYear)
  );

  return (
    <>
      <PageMeta title="Gestion des Bulletins de Paie - SMART NDC" description="Génération et validation des bulletins de paie" />
      <PageBreadcrumb pageTitle="Gestion des Bulletins de Paie" />

      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="px-5 py-5 sm:px-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-end gap-3">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-500">Mois</label>
                <Select options={monthOptions} defaultValue={selectedMonth} onChange={(v) => setSelectedMonth(v)} />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-500">Année</label>
                <Select options={yearOptions} defaultValue={selectedYear} onChange={(v) => setSelectedYear(v)} />
              </div>
              <button
                onClick={handleGenerate}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-5 py-3.5 text-sm font-medium text-white shadow-theme-xs hover:bg-brand-600"
              >
                <PlusIcon />
                Générer
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-t border-gray-100 bg-gray-50 dark:border-gray-800 dark:bg-white/[0.03]">
                <th className="px-5 py-4 text-left text-xs font-medium text-gray-500 uppercase">Employé</th>
                <th className="px-5 py-4 text-left text-xs font-medium text-gray-500 uppercase">Salaire de base</th>
                <th className="px-5 py-4 text-left text-xs font-medium text-gray-500 uppercase">Primes</th>
                <th className="px-5 py-4 text-left text-xs font-medium text-gray-500 uppercase">CNSS</th>
                <th className="px-5 py-4 text-left text-xs font-medium text-gray-500 uppercase">IR</th>
                <th className="px-5 py-4 text-left text-xs font-medium text-gray-500 uppercase">Net à payer</th>
                <th className="px-5 py-4 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                <th className="px-5 py-4 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((ps) => {
                const emp = employees.find((e) => e.id === ps.employeeId);
                return (
                  <tr key={ps.id} className="border-t border-gray-100 dark:border-gray-800">
                    <td className="px-5 py-4 text-sm font-medium text-gray-800 dark:text-white/90">
                      {emp ? `${emp.firstName} ${emp.lastName}` : ps.employeeName}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">{formatCurrency(ps.baseSalary)}</td>
                    <td className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">{formatCurrency(ps.bonuses)}</td>
                    <td className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">{formatCurrency(ps.cnss)}</td>
                    <td className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">{formatCurrency(ps.tax)}</td>
                    <td className="px-5 py-4 text-sm font-semibold text-gray-800 dark:text-white/90">{formatCurrency(ps.netSalary)}</td>
                    <td className="px-5 py-4">
                      {ps.status === "validated" ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-success-50 px-2.5 py-0.5 text-xs font-medium text-success-600 dark:bg-success-500/15 dark:text-success-500">Validé</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-warning-50 px-2.5 py-0.5 text-xs font-medium text-warning-600 dark:bg-warning-500/15 dark:text-orange-400">Brouillon</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right">
                      {ps.status === "draft" && (
                        <button
                          onClick={() => handleValidate(ps.id)}
                          className="rounded-lg bg-success-500 px-4 py-2 text-xs font-medium text-white hover:bg-success-600"
                        >
                          Valider
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-sm text-gray-400">
                    Aucun bulletin pour cette période
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
