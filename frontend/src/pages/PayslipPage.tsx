import { useAppStore } from "../store/appStore";
import PageMeta from "../components/common/PageMeta";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import { DownloadIcon } from "../icons";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "MAD", maximumFractionDigits: 0 }).format(amount);
}

const monthNamesFr = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

export default function PayslipPage() {
  const { employees, currentUser, paySlips } = useAppStore();

  const currentEmployee = currentUser
    ? employees.find((e) => e.email === currentUser.email)
    : undefined;

  const myPaySlips = paySlips.filter((ps) => ps.employeeId === currentEmployee?.id);

  return (
    <>
      <PageMeta
        title="Bulletins de Paie - SMART NDC"
        description="Consultez et téléchargez vos bulletins de paie"
      />
      <PageBreadcrumb pageTitle="Mes Bulletins de Paie" />

      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="px-5 py-5 sm:px-7">
          <h3 className="text-base font-medium text-gray-800 dark:text-white/90">
            Bulletins de Paie
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Consultez l'historique de vos bulletins de paie et téléchargez-les au format PDF.
          </p>
        </div>

        {myPaySlips.length === 0 ? (
          <div className="border-t border-gray-100 px-5 py-16 text-center dark:border-gray-800">
            <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
              <svg className="size-7 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Aucun bulletin de paie disponible pour le moment.
            </p>
            <p className="mt-1 text-xs text-gray-400">
              Les bulletins apparaîtront ici une fois validés par la direction.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-t border-gray-100 bg-gray-50 dark:border-gray-800 dark:bg-white/[0.03]">
                  <th className="px-5 py-4 text-left text-xs font-medium text-gray-500 uppercase">Période</th>
                  <th className="px-5 py-4 text-left text-xs font-medium text-gray-500 uppercase">Salaire de base</th>
                  <th className="px-5 py-4 text-left text-xs font-medium text-gray-500 uppercase">Primes</th>
                  <th className="px-5 py-4 text-left text-xs font-medium text-gray-500 uppercase">Heures sup.</th>
                  <th className="px-5 py-4 text-left text-xs font-medium text-gray-500 uppercase">CNSS</th>
                  <th className="px-5 py-4 text-left text-xs font-medium text-gray-500 uppercase">IR</th>
                  <th className="px-5 py-4 text-left text-xs font-medium text-gray-500 uppercase">Net à payer</th>
                  <th className="px-5 py-4 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                  <th className="px-5 py-4 text-right text-xs font-medium text-gray-500 uppercase">Télécharger</th>
                </tr>
              </thead>
              <tbody>
                {[...myPaySlips]
                  .sort((a, b) => b.year !== a.year ? b.year - a.year : b.month - a.month)
                  .map((ps) => (
                    <tr key={ps.id} className="border-t border-gray-100 dark:border-gray-800">
                      <td className="px-5 py-4 text-sm font-medium text-gray-800 dark:text-white/90">
                        {monthNamesFr[ps.month - 1]} {ps.year}
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {formatCurrency(ps.baseSalary)}
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {formatCurrency(ps.bonuses)}
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {formatCurrency(ps.overtime)}
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {formatCurrency(ps.cnss)}
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {formatCurrency(ps.tax)}
                      </td>
                      <td className="px-5 py-4 text-sm font-semibold text-gray-800 dark:text-white/90">
                        {formatCurrency(ps.netSalary)}
                      </td>
                      <td className="px-5 py-4">
                        {ps.status === "validated" ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-success-50 px-2.5 py-0.5 text-xs font-medium text-success-600 dark:bg-success-500/15 dark:text-success-500">
                            Validé
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-warning-50 px-2.5 py-0.5 text-xs font-medium text-warning-600 dark:bg-warning-500/15 dark:text-orange-400">
                            Brouillon
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-right">
                        {ps.status === "validated" ? (
                          <button className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white p-2 text-gray-700 shadow-theme-xs hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03]">
                            <DownloadIcon />
                          </button>
                        ) : (
                          <span className="text-xs text-gray-400">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
