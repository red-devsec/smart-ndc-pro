import { useState, useRef } from "react";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { useAppStore } from "../../store/appStore";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import Select from "../../components/form/Select";
import TextArea from "../../components/form/input/TextArea";
import { PlusIcon, CheckLineIcon, CloseLineIcon } from "../../icons";
import { uploadApi } from "../../services/api";

type Tab = "mine" | "all";

const leaveTypeLabels: Record<string, string> = {
  annual: "Congé annuel",
  sick: "Congé maladie",
  personal: "Congé personnel",
  maternity: "Congé maternité",
};

const leaveTypeOptions = [
  { value: "annual", label: "Congé annuel" },
  { value: "sick", label: "Congé maladie" },
  { value: "personal", label: "Congé personnel" },
  { value: "maternity", label: "Congé maternité" },
];

function generateId() {
  return `l${Date.now()}`;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export default function LeaveManagement() {
  const { leaves, employees, currentUser, addLeave, updateLeaveStatus } = useAppStore();
  const [tab, setTab] = useState<Tab>("all");
  const [showModal, setShowModal] = useState(false);

  const [leaveType, setLeaveType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [docFile, setDocFile] = useState<File | null>(null);
  const [docName, setDocName] = useState("");
  const [, setUploadingDoc] = useState(false);
  const docRef = useRef<HTMLInputElement>(null);

  const filteredLeaves = tab === "mine" && currentUser
    ? leaves.filter((l) => {
        const emp = employees.find((e) => e.email === currentUser?.email);
        return emp && l.employeeId === emp.id;
      })
    : leaves;

  const sortedLeaves = [...filteredLeaves].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const handleSubmitRequest = async () => {
    if (!leaveType || !startDate || !endDate || !reason) return;
    setUploadingDoc(true);

    try {
      let documentUrl = undefined as string | undefined;
      if (docFile) {
        const result = await uploadApi.file(docFile, "leaves");
        documentUrl = result.url;
      }

      const emp = currentUser
        ? employees.find((e) => e.email === currentUser.email)
        : undefined;

      addLeave({
        id: generateId(),
        employeeId: emp?.id || "unknown",
        employeeName: emp ? `${emp.firstName} ${emp.lastName}` : currentUser?.name || "Inconnu",
        type: leaveType as "annual" | "sick" | "personal" | "maternity",
        startDate,
        endDate,
        reason,
        status: "pending",
        document: documentUrl,
        createdAt: new Date().toISOString(),
      });
    } catch (err) {
      console.error("Upload document error:", err);
    } finally {
      setUploadingDoc(false);
      setLeaveType("");
      setStartDate("");
      setEndDate("");
      setReason("");
      setDocFile(null);
      setDocName("");
      setShowModal(false);
    }
  };

  const canManage =
    currentUser?.role === "ADMIN" || currentUser?.role === "RH";

  return (
    <>
      <PageMeta
        title="Gestion des Congés - SMART NDC"
        description="Gestion des demandes de congés"
      />
      <PageBreadcrumb pageTitle="Gestion des Congés" />

      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="px-5 py-5 sm:px-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-1 rounded-lg bg-gray-100 p-0.5 dark:bg-gray-900">
              <button
                onClick={() => setTab("all")}
                className={`rounded-md px-5 py-2 text-sm font-medium transition ${
                  tab === "all"
                    ? "bg-white text-gray-900 shadow-theme-xs dark:bg-gray-800 dark:text-white"
                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
                }`}
              >
                Toutes les demandes
              </button>
              <button
                onClick={() => setTab("mine")}
                className={`rounded-md px-5 py-2 text-sm font-medium transition ${
                  tab === "mine"
                    ? "bg-white text-gray-900 shadow-theme-xs dark:bg-gray-800 dark:text-white"
                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400"
                }`}
              >
                Mes demandes
              </button>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-5 py-3.5 text-sm font-medium text-white shadow-theme-xs hover:bg-brand-600"
            >
              <PlusIcon />
              Nouvelle demande
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-t border-gray-100 bg-gray-50 dark:border-gray-800 dark:bg-white/[0.03]">
                <th className="px-5 py-4 text-left text-xs font-medium text-gray-500 uppercase">Employé</th>
                <th className="px-5 py-4 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-5 py-4 text-left text-xs font-medium text-gray-500 uppercase">Dates</th>
                <th className="px-5 py-4 text-left text-xs font-medium text-gray-500 uppercase">Motif</th>
                <th className="px-5 py-4 text-left text-xs font-medium text-gray-500 uppercase">Document</th>
                <th className="px-5 py-4 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                {canManage && <th className="px-5 py-4 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {sortedLeaves.map((l) => (
                <tr key={l.id} className="border-t border-gray-100 dark:border-gray-800">
                  <td className="px-5 py-4 text-sm font-medium text-gray-800 dark:text-white/90">
                    {l.employeeName}
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {leaveTypeLabels[l.type] || l.type}
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(l.startDate)} → {formatDate(l.endDate)}
                  </td>
                  <td className="max-w-[200px] truncate px-5 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {l.reason}
                  </td>
                  <td className="px-5 py-4">
                    {l.document ? (
                      <a href={l.document} target="_blank" rel="noopener noreferrer" className="text-brand-500 hover:underline text-sm">
                        Voir
                      </a>
                    ) : (
                      <span className="text-gray-400 text-sm">—</span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    {l.status === "pending" && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-warning-50 px-2.5 py-0.5 text-xs font-medium text-warning-600 dark:bg-warning-500/15 dark:text-orange-400">
                        En attente
                      </span>
                    )}
                    {l.status === "approved" && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-success-50 px-2.5 py-0.5 text-xs font-medium text-success-600 dark:bg-success-500/15 dark:text-success-500">
                        Approuvé
                      </span>
                    )}
                    {l.status === "rejected" && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-error-50 px-2.5 py-0.5 text-xs font-medium text-error-600 dark:bg-error-500/15 dark:text-error-500">
                        Rejeté
                      </span>
                    )}
                  </td>
                  {canManage && (
                    <td className="px-5 py-4 text-right">
                      {l.status === "pending" && (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => updateLeaveStatus(l.id, "approved", currentUser?.name || "Admin")}
                            className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white p-2 text-success-600 shadow-theme-xs hover:bg-success-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-success-500/15"
                          >
                            <CheckLineIcon />
                          </button>
                          <button
                            onClick={() => updateLeaveStatus(l.id, "rejected", currentUser?.name || "Admin")}
                            className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white p-2 text-error-600 shadow-theme-xs hover:bg-error-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-error-500/15"
                          >
                            <CloseLineIcon />
                          </button>
                        </div>
                      )}
                    </td>
                  )}
                </tr>
              ))}
              {sortedLeaves.length === 0 && (
                <tr>
                  <td colSpan={canManage ? 7 : 6} className="px-5 py-12 text-center text-sm text-gray-400">
                    Aucune demande de congé
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-99999 flex items-center justify-center">
          <div className="fixed inset-0 h-full w-full bg-gray-400/50 backdrop-blur-[32px]" onClick={() => setShowModal(false)} />
          <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 dark:bg-gray-900">
            <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
              Nouvelle demande de congé
            </h3>
            <div className="space-y-4">
              <div>
                <Label>Type de congé</Label>
                <Select
                  options={leaveTypeOptions}
                  placeholder="Sélectionner un type"
                  defaultValue={leaveType}
                  onChange={(v) => setLeaveType(v)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Date de début</Label>
                  <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                </div>
                <div>
                  <Label>Date de fin</Label>
                  <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                </div>
              </div>
              <div>
                <Label>Motif</Label>
                <TextArea
                  placeholder="Raison de la demande..."
                  value={reason}
                  onChange={(v) => setReason(v)}
                  rows={3}
                />
              </div>
              <div>
                <Label>Document (optionnel)</Label>
                <div
                  onClick={() => docRef.current?.click()}
                  className="flex cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-4 text-sm text-gray-400 hover:border-brand-300 dark:border-gray-700"
                >
                  {docName ? (
                    <span className="text-gray-700 dark:text-gray-300">{docName}</span>
                  ) : (
                    <>
                      <svg className="mr-2 size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M12 4V16M8 12L12 16L16 12" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M4 17V19C4 20.1046 4.89543 21 6 21H18C19.1046 21 20 20.1046 20 19V17" strokeLinecap="round"/>
                      </svg>
                      Télécharger un justificatif
                    </>
                  )}
                </div>
                <input ref={docRef} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) { setDocFile(f); setDocName(f.name); }
                }} />
                {docName && (
                  <button type="button" onClick={() => { setDocFile(null); setDocName(""); }} className="mt-1 text-xs text-red-500 hover:underline">
                    Supprimer
                  </button>
                )}
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-5 py-3.5 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03]"
              >
                Annuler
              </button>
              <button
                onClick={handleSubmitRequest}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-5 py-3.5 text-sm font-medium text-white shadow-theme-xs hover:bg-brand-600"
              >
                <PlusIcon />
                Soumettre
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
