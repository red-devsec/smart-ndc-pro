import { useMemo, useState, useEffect, useRef } from "react";
import Chart from "react-apexcharts";
import { useAppStore } from "../../store/appStore";
import { generateId } from "../../utils/id";
import PageMeta from "../../components/common/PageMeta";
import { dashboardApi } from "../../services/api";
import { subscribeToEvent } from "../../services/socket";
import { exportElementToPdf } from "../../utils/exportPdf";
import {
  GroupIcon,
  BoxIconLine,
  AlertIcon,
  ErrorIcon,
  InfoIcon,
  UserCircleIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  CheckCircleIcon,
  CalenderIcon,
  CheckLineIcon,
  CloseLineIcon,
  FileIcon,
  DownloadIcon,
} from "../../icons";

export default function SmartDashboard() {
  const employees = useAppStore((s) => s.employees);
  const attendanceRecords = useAppStore((s) => s.attendanceRecords);
  const stockMovements = useAppStore((s) => s.stockMovements);
  const alerts = useAppStore((s) => s.alerts);
  const leaves = useAppStore((s) => s.leaves);
  const products = useAppStore((s) => s.products);

  const currentUser = useAppStore((s) => s.currentUser);
  const certificateRequests = useAppStore((s) => s.certificateRequests);
  const updateLeaveStatus = useAppStore((s) => s.updateLeaveStatus);
  const updateCertificateStatus = useAppStore((s) => s.updateCertificateStatus);

  const today = new Date().toISOString().split("T")[0];

  const todayAttendance = attendanceRecords.filter((a) => a.date === today);
  const activeAlerts = alerts.filter((a) => !a.isRead);
  const pendingLeaves = leaves.filter((l) => l.status === "pending");
  const pendingCertificates = certificateRequests.filter((cr) => cr.status === "pending");
  const lowStockCount = products.filter((p) => p.quantity <= p.minThreshold).length;

  const canManage =
    currentUser?.role === "ADMIN" || currentUser?.role === "RH" || currentUser?.role === "MANAGER";

  const presentCount = todayAttendance.filter(
    (a) => a.status === "present" || a.status === "late"
  ).length;
  const absentCount = employees.filter((e) => e.isActive).length - presentCount;

  const chartData = useMemo(() => {
    const grouped: Record<string, number> = {};
    const days: string[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" });
      days.push(key);
      grouped[key] = 0;
    }
    stockMovements.forEach((m) => {
      const d = new Date(m.timestamp);
      const key = d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" });
      if (grouped[key] !== undefined) {
        grouped[key]++;
      }
    });
    return { categories: days, data: days.map((d) => grouped[d]) };
  }, [stockMovements]);

  const recentMovements = [...stockMovements]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 6);

  const [liveFeed, setLiveFeed] = useState<
    { id: string; text: string; time: string; type: "checkin" | "scan" }[]
  >([]);

  useEffect(() => {
    // Real-time live feed via WebSocket (replaces mock interval)
    const unsubPointage = subscribeToEvent("pointage:created", (data: any) => {
      const name = data?.employeeName || "Employé";
      const action = data?.action === "out" ? "sortie" : "entrée";
      setLiveFeed((prev) =>
        [{ id: generateId(), text: `${name} a pointé (${action})`, time: new Date().toLocaleTimeString("fr-FR"), type: "checkin" as const }, ...prev].slice(0, 20)
      );
    });
    const unsubScan = subscribeToEvent("scan:created", (data: any) => {
      const product = data?.productName || `produit #${data?.productId ?? "?"}`;
      setLiveFeed((prev) =>
        [{ id: generateId(), text: `Scan produit — ${product}`, time: new Date().toLocaleTimeString("fr-FR"), type: "scan" as const }, ...prev].slice(0, 20)
      );
    });
    const unsubAlert = subscribeToEvent("alert:created", (data: any) => {
      setLiveFeed((prev) =>
        [{ id: generateId(), text: `Alerte: ${data?.message || ""}`, time: new Date().toLocaleTimeString("fr-FR"), type: "scan" as const }, ...prev].slice(0, 20)
      );
    });
    return () => { unsubPointage(); unsubScan(); unsubAlert(); };
  }, []);

  // Fallback: if no socket events, seed a quiet feed (no-op mock removed)
  useEffect(() => {
    if (liveFeed.length === 0) {
      const t = setTimeout(() => {
        setLiveFeed((prev) => prev.length === 0
          ? [{ id: generateId(), text: "En attente d'événements temps réel...", time: new Date().toLocaleTimeString("fr-FR"), type: "scan" as const }]
          : prev);
      }, 5000);
      return () => clearTimeout(t);
    }
  }, [liveFeed.length]);

  const dashboardRef = useRef<HTMLDivElement | null>(null);
  const [exporting, setExporting] = useState(false);
  const handleExportPdf = async () => {
    if (!dashboardRef.current) return;
    setExporting(true);
    try {
      await exportElementToPdf(dashboardRef.current, `dashboard-${today}.pdf`, "Smart NDC Pro — Tableau de bord");
    } finally {
      setExporting(false);
    }
  };

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <>
      <PageMeta
        title="Tableau de Bord"
        description="Tableau de bord ERP avec suivi RH et stock"
      />

      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-title-md font-bold text-gray-800 dark:text-white/90">
            Tableau de Bord
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {new Date().toLocaleDateString("fr-FR", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExportPdf}
            disabled={exporting}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
          >
            <DownloadIcon className="size-4" />
            {exporting ? "Export..." : "Capture PDF"}
          </button>
          <button
            onClick={async () => {
              try {
                const result = await dashboardApi.exportPdf();
                if (result.url) window.open(result.url, "_blank");
              } catch (err) {
                console.error("Export error:", err);
              }
            }}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
          >
            <DownloadIcon className="size-4" />
            Export PDF
          </button>
        </div>
      </div>

      <div ref={dashboardRef} className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="flex items-center justify-center w-10 h-10 bg-brand-50 rounded-xl dark:bg-brand-500/15">
              <GroupIcon className="text-brand-500 size-5" />
            </div>
            <h4 className="mt-3 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {employees.filter((e) => e.isActive).length}
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">Total Employés</p>
            <span className="text-theme-xs text-success-600">Actifs</span>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="flex items-center justify-center w-10 h-10 bg-success-50 rounded-xl dark:bg-success-500/15">
              <CheckCircleIcon className="text-success-600 size-5" />
            </div>
            <h4 className="mt-3 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {presentCount}
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">Présents Aujourd'hui</p>
            <span className="text-theme-xs text-success-600">En ligne</span>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="flex items-center justify-center w-10 h-10 bg-error-50 rounded-xl dark:bg-error-500/15">
              <ErrorIcon className="text-error-600 size-5" />
            </div>
            <h4 className="mt-3 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {absentCount}
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">Absents Aujourd'hui</p>
            <span className="text-theme-xs text-error-600">Absents</span>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="flex items-center justify-center w-10 h-10 bg-orange-50 rounded-xl dark:bg-warning-500/15">
              <CalenderIcon className="text-orange-600 size-5" />
            </div>
            <h4 className="mt-3 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {pendingLeaves.length}
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">Congés en Attente</p>
            <span className="text-theme-xs text-orange-600">En attente</span>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="flex items-center justify-center w-10 h-10 bg-blue-light-50 rounded-xl dark:bg-blue-light-500/15">
              <BoxIconLine className="text-blue-light-500 size-5" />
            </div>
            <h4 className="mt-3 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {products.length}
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">Produits en Stock</p>
            <span className="text-theme-xs text-blue-light-500">Références</span>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="flex items-center justify-center w-10 h-10 bg-error-50 rounded-xl dark:bg-error-500/15">
              <AlertIcon className="text-error-600 size-5" />
            </div>
            <h4 className="mt-3 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {lowStockCount}
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">Alertes Stock</p>
            <span
              className={`text-theme-xs ${
                lowStockCount > 0 ? "text-error-600" : "text-success-600"
              }`}
            >
              {lowStockCount > 0 ? "Critique" : "Aucune"}
            </span>
          </div>
        </div>

        {canManage && (pendingLeaves.length > 0 || pendingCertificates.length > 0) && (
          <div className="col-span-12">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
              <h3 className="mb-4 text-base font-medium text-gray-800 dark:text-white/90">
                Demandes en attente
              </h3>
              <div className="space-y-3">
                {pendingLeaves.map((l) => (
                  <div key={l.id} className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-white/[0.03]">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <CalenderIcon className="size-8 shrink-0 text-orange-500" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                          {l.employeeName}
                        </p>
                        <p className="text-theme-xs text-gray-500">
                          {l.type === "annual" ? "Congé annuel" : l.type === "sick" ? "Congé maladie" : l.type === "personal" ? "Congé personnel" : "Congé maternité"} · {new Date(l.startDate).toLocaleDateString("fr-FR")} au {new Date(l.endDate).toLocaleDateString("fr-FR")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => updateLeaveStatus(l.id, "approved", currentUser?.email || "")}
                        className="inline-flex items-center justify-center rounded-lg bg-success-50 p-2 text-success-600 hover:bg-success-100 dark:bg-success-500/15 dark:text-success-500"
                        title="Approuver"
                      >
                        <CheckLineIcon className="size-5" />
                      </button>
                      <button
                        onClick={() => updateLeaveStatus(l.id, "rejected", currentUser?.email || "")}
                        className="inline-flex items-center justify-center rounded-lg bg-error-50 p-2 text-error-600 hover:bg-error-100 dark:bg-error-500/15 dark:text-error-500"
                        title="Rejeter"
                      >
                        <CloseLineIcon className="size-5" />
                      </button>
                    </div>
                  </div>
                ))}
                {pendingCertificates.map((cr) => (
                  <div key={cr.id} className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-white/[0.03]">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <FileIcon className="size-8 shrink-0 text-brand-500" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                          {cr.employeeName}
                        </p>
                        <p className="text-theme-xs text-gray-500">
                          Attestation : {cr.type === "work" ? "Travail" : cr.type === "salary" ? "Salaire" : "Fiscale"} · {new Date(cr.createdAt).toLocaleDateString("fr-FR")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => updateCertificateStatus(cr.id, "generated")}
                        className="inline-flex items-center justify-center rounded-lg bg-success-50 p-2 text-success-600 hover:bg-success-100 dark:bg-success-500/15 dark:text-success-500"
                        title="Générer"
                      >
                        <CheckLineIcon className="size-5" />
                      </button>
                      <button
                        onClick={() => updateCertificateStatus(cr.id, "rejected")}
                        className="inline-flex items-center justify-center rounded-lg bg-error-50 p-2 text-error-600 hover:bg-error-100 dark:bg-error-500/15 dark:text-error-500"
                        title="Rejeter"
                      >
                        <CloseLineIcon className="size-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="col-span-12 xl:col-span-7">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
            <h3 className="mb-4 text-base font-medium text-gray-800 dark:text-white/90">
              Mouvements 7 derniers jours
            </h3>
            <Chart
              options={{
                chart: {
                  type: "bar",
                  fontFamily: "Outfit, sans-serif",
                  toolbar: { show: false },
                },
                colors: ["#465fff"],
                xaxis: { categories: chartData.categories },
                grid: {
                  borderColor: "#e4e7ec",
                  strokeDashArray: 4,
                },
                plotOptions: {
                  bar: { borderRadius: 4, columnWidth: "60%" },
                },
                dataLabels: { enabled: false },
                tooltip: {
                  theme: "dark",
                },
              }}
              series={[{ name: "Mouvements", data: chartData.data }]}
              type="bar"
              height={320}
            />
          </div>
        </div>

        <div className="col-span-12 xl:col-span-5">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
            <h3 className="mb-4 text-base font-medium text-gray-800 dark:text-white/90">
              Pointages du Jour
            </h3>
            <div className="space-y-3">
              {todayAttendance.length === 0 && (
                <p className="text-sm text-gray-400">Aucun pointage aujourd'hui</p>
              )}
              {todayAttendance.map((a) => (
                <div
                  key={a.id}
                  className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-white/[0.03]"
                >
                  <div className="flex items-center gap-3">
                    <UserCircleIcon className="size-8 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                        {a.employeeName}
                      </p>
                      <p className="text-theme-xs text-gray-500">
                        {formatTime(a.checkIn)}
                        {a.checkOut ? ` - ${formatTime(a.checkOut)}` : " (en cours)"}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-theme-xs font-medium ${
                      a.status === "present"
                        ? "bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-500"
                        : "bg-warning-50 text-warning-600 dark:bg-warning-500/15 dark:text-orange-400"
                    }`}
                  >
                    {a.status === "present" ? "Présent" : "En retard"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="col-span-12 xl:col-span-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
            <h3 className="mb-4 text-base font-medium text-gray-800 dark:text-white/90">
              Alertes Actives
            </h3>
            <div className="space-y-3">
              {activeAlerts.length === 0 && (
                <p className="text-sm text-gray-400">Aucune alerte active</p>
              )}
              {activeAlerts.map((al) => (
                <div
                  key={al.id}
                  className="flex items-start gap-3 rounded-lg border border-gray-100 p-3 dark:border-gray-700"
                >
                  {al.severity === "error" ? (
                    <ErrorIcon className="mt-0.5 size-5 shrink-0 text-error-500" />
                  ) : al.severity === "warning" ? (
                    <AlertIcon className="mt-0.5 size-5 shrink-0 text-warning-500" />
                  ) : (
                    <InfoIcon className="mt-0.5 size-5 shrink-0 text-blue-light-500" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-gray-800 dark:text-white/90">{al.message}</p>
                    <p className="text-theme-xs text-gray-500">{formatDate(al.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="col-span-12 xl:col-span-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
            <h3 className="mb-4 text-base font-medium text-gray-800 dark:text-white/90">
              Derniers Mouvements
            </h3>
            <div className="space-y-3">
              {recentMovements.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-white/[0.03]"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                      {m.productName}
                    </p>
                    <p className="text-theme-xs text-gray-500">
                      {m.employeeName} · {formatDate(m.timestamp)}
                    </p>
                  </div>
                  <span
                    className={`ml-3 inline-flex items-center rounded-full px-2 py-0.5 text-theme-xs font-medium ${
                      m.type === "in"
                        ? "bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-500"
                        : "bg-error-50 text-error-600 dark:bg-error-500/15 dark:text-error-500"
                    }`}
                  >
                    {m.type === "in" ? (
                      <ArrowUpIcon className="mr-1 size-3" />
                    ) : (
                      <ArrowDownIcon className="mr-1 size-3" />
                    )}
                    {m.type === "in" ? "Entrée" : "Sortie"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="col-span-12">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
            <div className="mb-4 flex items-center gap-2">
              <h3 className="text-base font-medium text-gray-800 dark:text-white/90">
                Flux Temps Réel
              </h3>
              <span className="inline-flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            </div>
            <div className="max-h-64 space-y-2 overflow-y-auto custom-scrollbar">
              {liveFeed.length === 0 && (
                <p className="text-sm text-gray-400">En attente d'événements...</p>
              )}
              {liveFeed.map((ev) => (
                <div
                  key={ev.id}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-700 dark:text-gray-300"
                >
                  <span className="text-theme-xs text-gray-400 shrink-0 w-16">
                    {ev.time}
                  </span>
                  {ev.type === "checkin" ? (
                    <CheckCircleIcon className="size-4 shrink-0 text-success-500" />
                  ) : (
                    <BoxIconLine className="size-4 shrink-0 text-brand-500" />
                  )}
                  <span>{ev.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
