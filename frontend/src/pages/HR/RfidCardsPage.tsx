import { useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { useAppStore } from "../../store/appStore";
import Select from "../../components/form/Select";
import { PlusIcon } from "../../icons";

function formatDate(dateStr?: string) {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export default function RfidCardsPage() {
  const { rfidCards, employees, toggleRfidCard, assignRfidCard } = useAppStore();
  const [assigningCardId, setAssigningCardId] = useState<string | null>(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");

  const unassignedEmployees = employees.filter((e) => e.isActive && !e.rfidCardId);

  const employeeOptions = unassignedEmployees.map((e) => ({
    value: e.id,
    label: `${e.firstName} ${e.lastName} - ${e.position}`,
  }));

  const handleAssign = (cardId: string) => {
    if (!selectedEmployeeId) return;
    assignRfidCard(cardId, selectedEmployeeId);
    setAssigningCardId(null);
    setSelectedEmployeeId("");
  };

  const handleToggle = (cardId: string) => {
    const card = rfidCards.find((c) => c.id === cardId);
    if (card?.employeeId) {
      toggleRfidCard(cardId);
    }
  };

  return (
    <>
      <PageMeta
        title="Gestion des Cartes RFID - SMART NDC"
        description="Gestion des cartes RFID des employés"
      />
      <PageBreadcrumb pageTitle="Gestion des Cartes RFID" />

      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="px-5 py-5 sm:px-7">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-medium text-gray-800 dark:text-white/90">
              Cartes RFID ({rfidCards.length})
            </h3>
            <button className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-5 py-3.5 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03]">
              <PlusIcon />
              Ajouter une carte
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-t border-gray-100 bg-gray-50 dark:border-gray-800 dark:bg-white/[0.03]">
                <th className="px-5 py-4 text-left text-xs font-medium text-gray-500 uppercase">UID</th>
                <th className="px-5 py-4 text-left text-xs font-medium text-gray-500 uppercase">Employé</th>
                <th className="px-5 py-4 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                <th className="px-5 py-4 text-left text-xs font-medium text-gray-500 uppercase">Date d'assignation</th>
                <th className="px-5 py-4 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rfidCards.map((card) => (
                <tr key={card.id} className="border-t border-gray-100 dark:border-gray-800">
                  <td className="px-5 py-4">
                    <span className="font-mono text-sm font-medium text-gray-800 dark:text-white/90">
                      {card.uid}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {card.employeeName || (
                      <span className="text-xs italic text-gray-400">Non assignée</span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    {card.isActive ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-success-50 px-2.5 py-0.5 text-xs font-medium text-success-600 dark:bg-success-500/15 dark:text-success-500">
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-error-50 px-2.5 py-0.5 text-xs font-medium text-error-600 dark:bg-error-500/15 dark:text-error-500">
                        Désactivée
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(card.assignedAt)}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {card.employeeId ? (
                        <button
                          onClick={() => handleToggle(card.id)}
                          className={`inline-flex items-center justify-center rounded-lg border px-4 py-2 text-xs font-medium transition ${
                            card.isActive
                              ? "border-gray-300 bg-white text-gray-700 shadow-theme-xs hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03]"
                              : "border-success-300 bg-success-50 text-success-600 hover:bg-success-100 dark:border-success-500/30 dark:bg-success-500/15 dark:text-success-500"
                          }`}
                        >
                          {card.isActive ? "Désactiver" : "Activer"}
                        </button>
                      ) : (
                        <button
                          onClick={() => setAssigningCardId(card.id)}
                          className="inline-flex items-center justify-center rounded-lg border border-brand-300 bg-brand-50 px-4 py-2 text-xs font-medium text-brand-600 hover:bg-brand-100 dark:border-brand-500/30 dark:bg-brand-500/15 dark:text-brand-500"
                        >
                          Assigner
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {rfidCards.some((c) => !c.isActive && c.employeeId) && (
        <div className="mx-5 mb-5 rounded-xl border border-warning-200 bg-warning-50 p-4 dark:border-warning-500/30 dark:bg-warning-500/10">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex size-5 items-center justify-center rounded-full bg-warning-500 text-white text-xs font-bold">!</div>
            <div>
              <p className="text-sm font-medium text-warning-800 dark:text-warning-400">
                Attention : Certaines cartes RFID sont désactivées
              </p>
              <p className="text-xs text-warning-700 dark:text-warning-500">
                Les employés avec une carte désactivée ne pourront pas pointer. Activez les cartes concernées pour rétablir l'accès.
              </p>
            </div>
          </div>
        </div>
      )}

      {assigningCardId && (
        <div className="fixed inset-0 z-99999 flex items-center justify-center">
          <div className="fixed inset-0 h-full w-full bg-gray-400/50 backdrop-blur-[32px]" onClick={() => { setAssigningCardId(null); setSelectedEmployeeId(""); }} />
          <div className="relative w-full max-w-md rounded-3xl bg-white p-6 dark:bg-gray-900">
            <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
              Assigner la carte RFID
            </h3>
            <div className="mb-4">
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Sélectionner un employé
              </label>
              <Select
                options={employeeOptions}
                placeholder="Choisir un employé"
                defaultValue={selectedEmployeeId}
                onChange={(v) => setSelectedEmployeeId(v)}
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => { setAssigningCardId(null); setSelectedEmployeeId(""); }}
                className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-5 py-3.5 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03]"
              >
                Annuler
              </button>
              <button
                onClick={() => handleAssign(assigningCardId)}
                disabled={!selectedEmployeeId}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-5 py-3.5 text-sm font-medium text-white shadow-theme-xs hover:bg-brand-600 disabled:bg-brand-300 disabled:cursor-not-allowed"
              >
                Assigner
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
