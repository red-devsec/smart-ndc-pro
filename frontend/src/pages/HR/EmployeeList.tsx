import { useState } from "react";
import { Link } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { useAppStore } from "../../store/appStore";
import { TrashBinIcon, PencilIcon, PlusIcon } from "../../icons";

const getInitials = (first: string, last: string) =>
  `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();

export default function EmployeeList() {
  const { employees, deleteEmployee } = useAppStore();
  const [search, setSearch] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const filtered = employees.filter((e) => {
    const q = search.toLowerCase();
    return (
      e.firstName.toLowerCase().includes(q) ||
      e.lastName.toLowerCase().includes(q) ||
      e.email.toLowerCase().includes(q) ||
      e.position.toLowerCase().includes(q) ||
      e.departmentName.toLowerCase().includes(q)
    );
  });

  const handleDelete = (id: string) => {
    deleteEmployee(id);
    setConfirmDelete(null);
  };

  return (
    <>
      <PageMeta
        title="Gestion des Employés - SMART NDC"
        description="Liste et gestion des employés SMART NDC"
      />
      <PageBreadcrumb pageTitle="Gestion des Employés" />

      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="px-5 py-7 sm:px-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full max-w-xs">
              <input
                type="text"
                placeholder="Rechercher un employé..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-11 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
              />
            </div>
            <Link
              to="/employees/new"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-5 py-3.5 text-sm font-medium text-white shadow-theme-xs hover:bg-brand-600"
            >
              <PlusIcon />
              Ajouter un employé
            </Link>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-t border-gray-100 bg-gray-50 dark:border-gray-800 dark:bg-white/[0.03]">
                <th className="px-5 py-4 text-left text-xs font-medium text-gray-500 uppercase">Photo</th>
                <th className="px-5 py-4 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
                <th className="px-5 py-4 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-5 py-4 text-left text-xs font-medium text-gray-500 uppercase">Poste</th>
                <th className="px-5 py-4 text-left text-xs font-medium text-gray-500 uppercase">Département</th>
                <th className="px-5 py-4 text-left text-xs font-medium text-gray-500 uppercase">Carte RFID</th>
                <th className="px-5 py-4 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                <th className="px-5 py-4 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((emp) => (
                <tr key={emp.id} className="border-t border-gray-100 dark:border-gray-800">
                  <td className="px-5 py-4">
                    {emp.photo ? (
                      <img src={emp.photo} alt="" className="size-9 rounded-full object-cover" />
                    ) : (
                      <div className="flex items-center justify-center rounded-full bg-brand-50 text-brand-500 size-9 dark:bg-brand-500/15">
                        <span className="text-sm font-semibold">{getInitials(emp.firstName, emp.lastName)}</span>
                      </div>
                    )}
                  </td>
                  <td className="px-5 py-4 text-sm font-medium text-gray-800 dark:text-white/90">
                    {emp.firstName} {emp.lastName}
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">{emp.email}</td>
                  <td className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">{emp.position}</td>
                  <td className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">{emp.departmentName}</td>
                  <td className="px-5 py-4">
                    {emp.cardUid ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-success-50 px-2.5 py-0.5 text-xs font-medium text-success-600 dark:bg-success-500/15 dark:text-success-500">
                        {emp.cardUid}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-500 dark:bg-white/5 dark:text-gray-400">
                        Non assignée
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    {emp.isActive ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-success-50 px-2.5 py-0.5 text-xs font-medium text-success-600 dark:bg-success-500/15 dark:text-success-500">
                        Actif
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-error-50 px-2.5 py-0.5 text-xs font-medium text-error-600 dark:bg-error-500/15 dark:text-error-500">
                        Inactif
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        to={`/employees/${emp.id}/edit`}
                        className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white p-2 text-gray-700 shadow-theme-xs hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-300"
                      >
                        <PencilIcon />
                      </Link>
                      <button
                        onClick={() => setConfirmDelete(emp.id)}
                        className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white p-2 text-gray-700 shadow-theme-xs hover:bg-error-50 hover:text-error-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-error-500/15 dark:hover:text-error-500"
                      >
                        <TrashBinIcon />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-sm text-gray-400">
                    Aucun employé trouvé
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {confirmDelete && (
        <div className="fixed inset-0 z-99999 flex items-center justify-center">
          <div className="fixed inset-0 h-full w-full bg-gray-400/50 backdrop-blur-[32px]" onClick={() => setConfirmDelete(null)} />
          <div className="relative w-full max-w-md rounded-3xl bg-white p-6 dark:bg-gray-900">
            <h3 className="mb-2 text-lg font-semibold text-gray-800 dark:text-white/90">
              Confirmer la suppression
            </h3>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
              Êtes-vous sûr de vouloir supprimer cet employé ? Cette action est irréversible.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-5 py-3.5 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03]"
              >
                Annuler
              </button>
              <button
                onClick={() => handleDelete(confirmDelete)}
                className="inline-flex items-center justify-center rounded-lg bg-error-500 px-5 py-3.5 text-sm font-medium text-white shadow-theme-xs hover:bg-error-600"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
