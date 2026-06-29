import { useAppStore } from "../store/appStore";
import PageMeta from "../components/common/PageMeta";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import { AlertIcon, ErrorIcon, InfoIcon, CheckCircleIcon } from "../icons";

export default function AlertPage() {
  const { alerts, markAlertRead } = useAppStore();

  const severityIcon = (severity: string) => {
    switch (severity) {
      case "error": return <ErrorIcon className="size-5 text-error-500" />;
      case "warning": return <AlertIcon className="size-5 text-warning-500" />;
      default: return <InfoIcon className="size-5 text-brand-500" />;
    }
  };

  const severityBg = (severity: string) => {
    switch (severity) {
      case "error": return "bg-error-50 border-error-200 dark:bg-error-500/10 dark:border-error-500/20";
      case "warning": return "bg-warning-50 border-warning-200 dark:bg-warning-500/10 dark:border-warning-500/20";
      default: return "bg-brand-50 border-brand-200 dark:bg-brand-500/10 dark:border-brand-500/20";
    }
  };

  return (
    <>
      <PageMeta title="Alertes - SMART NDC" description="Centre d'alertes" />
      <PageBreadcrumb pageTitle="Centre d'alertes" />
      <div className="space-y-4">
        {alerts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400 dark:text-gray-500">
            <CheckCircleIcon className="size-16 mb-4 text-success-500" />
            <p className="text-lg font-medium">Aucune alerte</p>
            <p className="text-sm">Tout est sous contrôle</p>
          </div>
        )}
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`flex items-start gap-4 rounded-2xl border p-5 ${severityBg(alert.severity)} ${
              !alert.isRead ? "ring-2 ring-inset ring-brand-500/20" : ""
            }`}
          >
            <div className="mt-0.5">{severityIcon(alert.severity)}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">{alert.message}</p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {new Date(alert.createdAt).toLocaleDateString("fr-FR", {
                  day: "numeric", month: "long", hour: "2-digit", minute: "2-digit"
                })}
              </p>
            </div>
            {!alert.isRead && (
              <button
                onClick={() => markAlertRead(alert.id)}
                className="shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-500/10"
              >
                Marquer lue
              </button>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
