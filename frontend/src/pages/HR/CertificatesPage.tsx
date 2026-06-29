import { useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { useAppStore } from "../../store/appStore";
import Select from "../../components/form/Select";
import { PlusIcon, DownloadIcon, FileIcon } from "../../icons";

const certificateTypeLabels: Record<string, string> = {
  work: "Attestation de Travail",
  salary: "Attestation de Salaire",
  tax: "Attestation Fiscale (IR)",
};

const certificateTypeList = [
  { value: "work", label: "Attestation de Travail" },
  { value: "salary", label: "Attestation de Salaire" },
  { value: "tax", label: "Attestation Fiscale (IR)" },
];

function generateId() {
  return `cr${Date.now()}`;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "MAD", maximumFractionDigits: 0 }).format(amount);
}

const monthNamesFr = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

export default function CertificatesPage() {
  const { employees, currentUser, certificateRequests, paySlips, addCertificateRequest } = useAppStore();
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedType, setSelectedType] = useState("");

  const currentEmployee = currentUser
    ? employees.find((e) => e.email === currentUser.email)
    : undefined;

  const myCertificates = certificateRequests.filter(
    (cr) => cr.employeeId === currentEmployee?.id || cr.employeeName === currentUser?.name
  );

  const myPaySlips = paySlips.filter((ps) => ps.employeeId === currentEmployee?.id);

  const handleRequestCertificate = () => {
    if (!selectedType) return;

    addCertificateRequest({
      id: generateId(),
      employeeId: currentEmployee?.id || "unknown",
      employeeName: currentEmployee
        ? `${currentEmployee.firstName} ${currentEmployee.lastName}`
        : currentUser?.name || "Inconnu",
      type: selectedType as "work" | "salary" | "tax",
      status: "pending",
      createdAt: new Date().toISOString(),
    });

    setSelectedType("");
    setShowRequestModal(false);
  };

  return (
    <>
      <PageMeta
        title="Attestations & Bulletins - SMART NDC"
        description="Gestion des attestations et bulletins de paie"
      />
      <PageBreadcrumb pageTitle="Attestations & Bulletins" />

      <div className="space-y-6">
        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="px-5 py-5 sm:px-7">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-medium text-gray-800 dark:text-white/90">
                Attestations
              </h3>
              <button
                onClick={() => setShowRequestModal(true)}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-5 py-3.5 text-sm font-medium text-white shadow-theme-xs hover:bg-brand-600"
              >
                <PlusIcon />
                Demander une attestation
              </button>
            </div>
          </div>
          <div className="border-t border-gray-100 px-5 py-5 dark:border-gray-800">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {certificateTypeList.map((ct) => (
                <div
                  key={ct.value}
                  className="rounded-xl border border-gray-200 p-4 dark:border-gray-700"
                >
                  <div className="mb-3 flex size-10 items-center justify-center rounded-lg bg-brand-50 text-brand-500 dark:bg-brand-500/15">
                    <FileIcon />
                  </div>
                  <h4 className="mb-1 text-sm font-medium text-gray-800 dark:text-white/90">
                    {ct.label}
                  </h4>
                  <p className="mb-3 text-xs text-gray-500 dark:text-gray-400">
                    Téléchargez votre document officiel
                  </p>
                  <button
                    onClick={() => {
                      setSelectedType(ct.value);
                      setShowRequestModal(true);
                    }}
                    className="inline-flex items-center justify-center rounded-lg bg-brand-500 px-4 py-2 text-xs font-medium text-white hover:bg-brand-600"
                  >
                    Demander
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="px-5 py-5 sm:px-7">
            <h3 className="text-base font-medium text-gray-800 dark:text-white/90">
              Historique des demandes
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-t border-gray-100 bg-gray-50 dark:border-gray-800 dark:bg-white/[0.03]">
                  <th className="px-5 py-4 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-5 py-4 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-5 py-4 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                  <th className="px-5 py-4 text-right text-xs font-medium text-gray-500 uppercase">Document</th>
                </tr>
              </thead>
              <tbody>
                {myCertificates.map((cr) => (
                  <tr key={cr.id} className="border-t border-gray-100 dark:border-gray-800">
                    <td className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {certificateTypeLabels[cr.type] || cr.type}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(cr.createdAt)}
                    </td>
                    <td className="px-5 py-4">
                      {cr.status === "pending" && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-warning-50 px-2.5 py-0.5 text-xs font-medium text-warning-600 dark:bg-warning-500/15 dark:text-orange-400">
                          En attente
                        </span>
                      )}
                      {cr.status === "generated" && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-success-50 px-2.5 py-0.5 text-xs font-medium text-success-600 dark:bg-success-500/15 dark:text-success-500">
                          Généré
                        </span>
                      )}
                      {cr.status === "rejected" && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-error-50 px-2.5 py-0.5 text-xs font-medium text-error-600 dark:bg-error-500/15 dark:text-error-500">
                          Rejeté
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right">
                      {cr.documentUrl ? (
                        <button className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white p-2 text-gray-700 shadow-theme-xs hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03]">
                          <DownloadIcon />
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                ))}
                {myCertificates.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-5 py-12 text-center text-sm text-gray-400">
                      Aucune demande d'attestation
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="px-5 py-5 sm:px-7">
            <h3 className="text-base font-medium text-gray-800 dark:text-white/90">
              Bulletins de Paie
            </h3>
          </div>
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
                  <th className="px-5 py-4 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
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
                        {ps.status === "validated" && (
                          <button className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white p-2 text-gray-700 shadow-theme-xs hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03]">
                            <DownloadIcon />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                {myPaySlips.length === 0 && (
                  <tr>
                    <td colSpan={9} className="px-5 py-12 text-center text-sm text-gray-400">
                      Aucun bulletin de paie disponible
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showRequestModal && (
        <div className="fixed inset-0 z-99999 flex items-center justify-center">
          <div className="fixed inset-0 h-full w-full bg-gray-400/50 backdrop-blur-[32px]" onClick={() => setShowRequestModal(false)} />
          <div className="relative w-full max-w-md rounded-3xl bg-white p-6 dark:bg-gray-900">
            <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
              Demander une attestation
            </h3>
            <div className="mb-4">
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Type d'attestation
              </label>
              <Select
                options={certificateTypeList}
                placeholder="Sélectionner un type"
                defaultValue={selectedType}
                onChange={(v) => setSelectedType(v)}
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowRequestModal(false)}
                className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-5 py-3.5 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03]"
              >
                Annuler
              </button>
              <button
                onClick={handleRequestCertificate}
                disabled={!selectedType}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-5 py-3.5 text-sm font-medium text-white shadow-theme-xs hover:bg-brand-600 disabled:bg-brand-300 disabled:cursor-not-allowed"
              >
                <PlusIcon />
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
