import { useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import Button from "../../components/ui/button/Button";

type Tab = "general" | "security" | "notifications" | "database";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("general");
  const [companyName, setCompanyName] = useState("SMART NDC");
  const [language, setLanguage] = useState("fr");
  const [workStart, setWorkStart] = useState("08:00");
  const [workEnd, setWorkEnd] = useState("18:00");
  const [minPasswordLength, setMinPasswordLength] = useState("8");
  const [requireSpecialChars, setRequireSpecialChars] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState("30");
  const [twoFA, setTwoFA] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [inAppEnabled, setInAppEnabled] = useState(true);
  const [autoBackup, setAutoBackup] = useState(false);
  const [lastBackup] = useState("13/06/2026 23:00");
  const [toast, setToast] = useState("");

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: "general", label: "Général" },
    { id: "security", label: "Sécurité" },
    { id: "notifications", label: "Notifications" },
    { id: "database", label: "Base de données" },
  ];

  const handleSave = () => {
    showToast("Paramètres enregistrés avec succès !");
  };

  return (
    <>
      <PageMeta
        title="Paramètres - SMART NDC"
        description="Paramètres de l'application"
      />

      <div className="mb-6">
        <h1 className="text-title-md font-bold text-gray-800 dark:text-white/90">
          Paramètres
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Gérez les paramètres de l'application
        </p>
      </div>

      {toast && (
        <div className="mb-4 rounded-lg bg-success-50 px-4 py-3 text-sm text-success-700 dark:bg-success-500/15 dark:text-success-500">
          {toast}
        </div>
      )}

      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="border-b border-gray-200 px-6 dark:border-gray-800">
          <div className="-mb-px flex gap-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-3 pt-5 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? "border-b-2 border-brand-500 text-brand-500"
                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white/90"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {activeTab === "general" && (
            <div className="space-y-5 max-w-lg">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  Nom de la société
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:text-white/90"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  Logo
                </label>
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gray-100 text-sm text-gray-400 dark:bg-gray-800">
                    Logo
                  </div>
                  <Button variant="outline">Charger</Button>
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  Langue
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:text-white/90"
                >
                  <option value="fr">Français</option>
                  <option value="en">English</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                    Début journée
                  </label>
                  <input
                    type="time"
                    value={workStart}
                    onChange={(e) => setWorkStart(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:text-white/90"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                    Fin journée
                  </label>
                  <input
                    type="time"
                    value={workEnd}
                    onChange={(e) => setWorkEnd(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:text-white/90"
                  />
                </div>
              </div>
              <Button onClick={handleSave}>Enregistrer</Button>
            </div>
          )}

          {activeTab === "security" && (
            <div className="space-y-5 max-w-lg">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  Longueur minimale mot de passe
                </label>
                <input
                  type="number"
                  value={minPasswordLength}
                  onChange={(e) => setMinPasswordLength(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:text-white/90"
                />
              </div>
              <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                <div>
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                    Caractères spéciaux requis
                  </p>
                  <p className="text-theme-xs text-gray-500">
                    Exiger au moins un caractère spécial
                  </p>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={requireSpecialChars}
                    onChange={(e) => setRequireSpecialChars(e.target.checked)}
                    className="peer sr-only"
                  />
                  <span className="h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-brand-500 peer-checked:after:translate-x-full peer-focus:outline-none dark:bg-gray-700" />
                </label>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  Timeout session (minutes)
                </label>
                <input
                  type="number"
                  value={sessionTimeout}
                  onChange={(e) => setSessionTimeout(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:text-white/90"
                />
              </div>
              <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                <div>
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                    Authentification 2 facteurs (2FA)
                  </p>
                  <p className="text-theme-xs text-gray-500">
                    Renforce la sécurité du compte
                  </p>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={twoFA}
                    onChange={(e) => setTwoFA(e.target.checked)}
                    className="peer sr-only"
                  />
                  <span className="h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-brand-500 peer-checked:after:translate-x-full peer-focus:outline-none dark:bg-gray-700" />
                </label>
              </div>
              <Button onClick={handleSave}>Enregistrer</Button>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="space-y-4 max-w-lg">
              {[
                {
                  key: "push",
                  label: "Notifications Push",
                  desc: "Recevoir les notifications sur le navigateur",
                  checked: pushEnabled,
                  set: setPushEnabled,
                },
                {
                  key: "email",
                  label: "Notifications Email",
                  desc: "Recevoir les notifications par email",
                  checked: emailEnabled,
                  set: setEmailEnabled,
                },
                {
                  key: "inapp",
                  label: "Notifications In-App",
                  desc: "Recevoir les notifications dans l'application",
                  checked: inAppEnabled,
                  set: setInAppEnabled,
                },
              ].map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between rounded-lg border border-gray-200 p-4 dark:border-gray-700"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                      {item.label}
                    </p>
                    <p className="text-theme-xs text-gray-500">{item.desc}</p>
                  </div>
                  <label className="relative inline-flex cursor-pointer items-center">
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={(e) => item.set(e.target.checked)}
                      className="peer sr-only"
                    />
                    <span className="h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-brand-500 peer-checked:after:translate-x-full peer-focus:outline-none dark:bg-gray-700" />
                  </label>
                </div>
              ))}
              <Button onClick={handleSave}>Enregistrer</Button>
            </div>
          )}

          {activeTab === "database" && (
            <div className="space-y-5 max-w-lg">
              <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Dernière sauvegarde
                </p>
                <p className="mt-1 text-sm font-medium text-gray-800 dark:text-white/90">
                  {lastBackup}
                </p>
              </div>
              <Button onClick={() => showToast("Sauvegarde en cours... (simulation)")}>
                Sauvegarder maintenant
              </Button>
              <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                <div>
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                    Sauvegarde automatique
                  </p>
                  <p className="text-theme-xs text-gray-500">
                    Sauvegarder automatiquement chaque jour
                  </p>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={autoBackup}
                    onChange={(e) => setAutoBackup(e.target.checked)}
                    className="peer sr-only"
                  />
                  <span className="h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-brand-500 peer-checked:after:translate-x-full peer-focus:outline-none dark:bg-gray-700" />
                </label>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
