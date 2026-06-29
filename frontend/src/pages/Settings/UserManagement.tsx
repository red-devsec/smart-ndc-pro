import { useMemo, useState } from "react";
import { useAppStore } from "../../store/appStore";
import type { UserRole } from "../../data/types";

const roleLabels: Record<UserRole, string> = {
  ADMIN: "Administrateur",
  MANAGER: "Manager",
  RH: "Responsable RH",
  MAGASINIER: "Magasinier",
  EMPLOYE: "Employé",
};

const roleOptions: { value: UserRole; label: string }[] = [
  { value: "EMPLOYE", label: "Employé" },
  { value: "RH", label: "Responsable RH" },
  { value: "MAGASINIER", label: "Magasinier" },
  { value: "MANAGER", label: "Manager" },
  { value: "ADMIN", label: "Administrateur" },
];

const roleColor = (role: UserRole) => {
  switch (role) {
    case "ADMIN": return "bg-red-100 text-red-700";
    case "MANAGER": return "bg-purple-100 text-purple-700";
    case "RH": return "bg-blue-100 text-blue-700";
    case "MAGASINIER": return "bg-amber-100 text-amber-700";
    case "EMPLOYE": return "bg-green-100 text-green-700";
  }
};

export default function UserManagement() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "EMPLOYE" as UserRole,
  });
  const [toast, setToast] = useState("");

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const employees = useAppStore((s) => s.employees);
  const systemUsers = useMemo(
    () =>
      employees.map((e) => ({
        id: e.id,
        name: `${e.firstName} ${e.lastName}`,
        email: e.email,
        role: (e.departmentId === "d1"
          ? "ADMIN"
          : e.departmentId === "d2"
            ? "RH"
            : e.departmentId === "d5"
              ? "MAGASINIER"
              : e.departmentId === "d6"
                ? "MANAGER"
                : "EMPLOYE") as UserRole,
      })),
    [employees]
  );

  const openAddModal = () => {
    setEditId(null);
    setForm({ name: "", email: "", password: "", role: "EMPLOYE" });
    setModalOpen(true);
  };

  const openEditModal = (user: (typeof systemUsers)[number]) => {
    setEditId(user.id);
    setForm({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role,
    });
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!form.name || !form.email) {
      showToast("Veuillez remplir tous les champs");
      return;
    }
    showToast(editId ? "Utilisateur modifié" : "Utilisateur ajouté");
    setModalOpen(false);
  };

  const handleDelete = () => {
    if (editId) {
      showToast("Utilisateur supprimé");
      setModalOpen(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Gestion des Utilisateurs
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Gérez les droits d'accès au système
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors"
        >
          + Nouvel utilisateur
        </button>
      </div>

      {/* Toast */}
      {toast && (
        <div className="mb-4 px-4 py-2 bg-green-100 text-green-800 rounded-lg text-sm">
          {toast}
        </div>
      )}

      {/* Tableau */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Nom</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Rôle</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {systemUsers.map((user) => (
              <tr key={user.id} className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30">
                <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{user.name}</td>
                <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{user.email}</td>
                <td className="px-4 py-3">
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${roleColor(user.role)}`}>
                    {roleLabels[user.role]}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => openEditModal(user)}
                    className="px-3 py-1.5 text-xs font-medium text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/20 rounded-lg transition-colors"
                  >
                    Modifier
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md p-6 mx-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {editId ? "Modifier l'utilisateur" : "Nouvel utilisateur"}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nom</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mot de passe</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder={editId ? "Laisser vide pour conserver" : "Mot de passe"}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rôle</label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value as UserRole })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                >
                  {roleOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              {editId && (
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                >
                  Supprimer
                </button>
              )}
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                Annuler
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 rounded-lg"
              >
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
