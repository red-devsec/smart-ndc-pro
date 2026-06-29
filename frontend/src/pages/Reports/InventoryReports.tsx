import { useState, useMemo } from "react";
import Chart from "react-apexcharts";
import PageMeta from "../../components/common/PageMeta";
import ComponentCard from "../../components/common/ComponentCard";
import Button from "../../components/ui/button/Button";
import Badge from "../../components/ui/badge/Badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
} from "../../components/ui/table";
import { useAppStore } from "../../store/appStore";
import {
  DownloadIcon,
  FileIcon,
  ArrowUpIcon,
  ArrowDownIcon,
} from "../../icons";

export default function InventoryReports() {
  const products = useAppStore((s) => s.products);
  const stockMovements = useAppStore((s) => s.stockMovements);

  const [mvtDebut, setMvtDebut] = useState("");
  const [mvtFin, setMvtFin] = useState("");
  const [toast, setToast] = useState("");

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const totalValue = useMemo(
    () => products.reduce((sum, p) => sum + p.price * p.quantity, 0),
    [products]
  );

  const lowStockProducts = useMemo(
    () => products.filter((p) => p.quantity <= p.minThreshold),
    [products]
  );

  const filteredMovements = useMemo(() => {
    if (!mvtDebut || !mvtFin) return stockMovements;
    const debut = new Date(mvtDebut);
    const fin = new Date(mvtFin);
    return stockMovements.filter((m) => {
      const d = new Date(m.timestamp);
      return d >= debut && d <= fin;
    });
  }, [stockMovements, mvtDebut, mvtFin]);

  const pieData = useMemo(() => {
    const ins = filteredMovements.filter((m) => m.type === "in").length;
    const outs = filteredMovements.filter((m) => m.type === "out").length;
    return { ins, outs };
  }, [filteredMovements]);

  const exportPdf = () => showToast("Export PDF inventaire complet (simulation)");
  const exportExcel = () => showToast("Export Excel inventaire complet (simulation)");

  return (
    <>
      <PageMeta
        title="Rapports Stock - SMART NDC"
        description="Génération de rapports d'inventaire"
      />

      <div className="mb-6">
        <h1 className="text-title-md font-bold text-gray-800 dark:text-white/90">
          Rapports Stock
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Export et analyse des stocks et mouvements
        </p>
      </div>

      {toast && (
        <div className="mb-4 rounded-lg bg-success-50 p-4 text-sm text-success-700 dark:bg-success-500/15 dark:text-success-500">
          {toast}
        </div>
      )}

      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12">
          <ComponentCard title="Export Inventaire Complet">
            <div className="mb-4 flex flex-wrap gap-4">
              <div className="rounded-lg bg-gray-50 px-4 py-3 dark:bg-white/[0.03]">
                <p className="text-theme-xs text-gray-500">Total Produits</p>
                <p className="text-lg font-bold text-gray-800 dark:text-white/90">
                  {products.length}
                </p>
              </div>
              <div className="rounded-lg bg-gray-50 px-4 py-3 dark:bg-white/[0.03]">
                <p className="text-theme-xs text-gray-500">Valeur Totale</p>
                <p className="text-lg font-bold text-gray-800 dark:text-white/90">
                  {totalValue.toLocaleString("fr-FR")} DH
                </p>
              </div>
              <div className="rounded-lg bg-gray-50 px-4 py-3 dark:bg-white/[0.03]">
                <p className="text-theme-xs text-gray-500">Produits &lt; Seuil</p>
                <p className="text-lg font-bold text-error-600">
                  {lowStockProducts.length}
                </p>
              </div>
            </div>
            <div className="mb-4 flex gap-3">
              <Button startIcon={<FileIcon className="size-4" />} onClick={exportPdf}>
                Export PDF
              </Button>
              <Button
                variant="outline"
                startIcon={<DownloadIcon className="size-4" />}
                onClick={exportExcel}
              >
                Export Excel
              </Button>
            </div>
            <div className="overflow-x-auto custom-scrollbar">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableCell isHeader>Produit</TableCell>
                    <TableCell isHeader>Catégorie</TableCell>
                    <TableCell isHeader>Code-barres</TableCell>
                    <TableCell isHeader>Qté</TableCell>
                    <TableCell isHeader>Seuil</TableCell>
                    <TableCell isHeader>Prix</TableCell>
                    <TableCell isHeader>Valeur</TableCell>
                    <TableCell isHeader>Statut</TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.name}</TableCell>
                      <TableCell>{p.category}</TableCell>
                      <TableCell className="text-theme-xs text-gray-500">
                        {p.barcode}
                      </TableCell>
                      <TableCell>{p.quantity}</TableCell>
                      <TableCell>{p.minThreshold}</TableCell>
                      <TableCell>{p.price.toLocaleString("fr-FR")} DH</TableCell>
                      <TableCell>
                        {(p.price * p.quantity).toLocaleString("fr-FR")} DH
                      </TableCell>
                      <TableCell>
                        <Badge
                          color={
                            p.quantity === 0
                              ? "error"
                              : p.quantity <= p.minThreshold
                                ? "warning"
                                : "success"
                          }
                        >
                          {p.quantity === 0
                            ? "Rupture"
                            : p.quantity <= p.minThreshold
                              ? "Stock bas"
                              : "OK"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </ComponentCard>
        </div>

        <div className="col-span-12">
          <ComponentCard title="Rapport Mouvements par Période">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  Date début
                </label>
                <input
                  type="date"
                  value={mvtDebut}
                  onChange={(e) => setMvtDebut(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:text-white/90"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  Date fin
                </label>
                <input
                  type="date"
                  value={mvtFin}
                  onChange={(e) => setMvtFin(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:text-white/90"
                />
              </div>
            </div>

            <div className="mt-4 grid grid-cols-12 gap-4">
              <div className="col-span-12 xl:col-span-4">
                <div className="rounded-lg bg-gray-50 p-4 dark:bg-white/[0.03]">
                  <h4 className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-400">
                    Distribution Entrées / Sorties
                  </h4>
                  {filteredMovements.length > 0 ? (
                    <Chart
                      options={{
                        chart: {
                          type: "pie",
                          fontFamily: "Outfit, sans-serif",
                        },
                        labels: ["Entrées", "Sorties"],
                        colors: ["#12b76a", "#f04438"],
                        legend: { position: "bottom" },
                        dataLabels: { enabled: true, formatter: (v: number) => `${Math.round(v)}%` },
                      }}
                      series={[pieData.ins, pieData.outs]}
                      type="pie"
                      height={280}
                    />
                  ) : (
                    <p className="text-sm text-gray-400">Aucune donnée</p>
                  )}
                </div>
              </div>

              <div className="col-span-12 xl:col-span-8">
                {filteredMovements.length > 0 ? (
                  <div className="overflow-x-auto custom-scrollbar">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableCell isHeader>Produit</TableCell>
                          <TableCell isHeader>Type</TableCell>
                          <TableCell isHeader>Qté</TableCell>
                          <TableCell isHeader>Employé</TableCell>
                          <TableCell isHeader>Date</TableCell>
                          <TableCell isHeader>Raison</TableCell>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredMovements.map((m) => (
                          <TableRow key={m.id}>
                            <TableCell className="font-medium">
                              {m.productName}
                            </TableCell>
                            <TableCell>
                              <Badge
                                color={m.type === "in" ? "success" : "error"}
                              >
                                {m.type === "in" ? (
                                  <ArrowUpIcon className="mr-1 size-3" />
                                ) : (
                                  <ArrowDownIcon className="mr-1 size-3" />
                                )}
                                {m.type === "in" ? "Entrée" : "Sortie"}
                              </Badge>
                            </TableCell>
                            <TableCell>{m.quantity}</TableCell>
                            <TableCell>{m.employeeName}</TableCell>
                            <TableCell>
                              {new Date(m.timestamp).toLocaleDateString("fr-FR")}
                            </TableCell>
                            <TableCell className="text-theme-xs text-gray-500">
                              {m.reason === "replenishment"
                                ? "Réappro"
                                : m.reason === "sale"
                                  ? "Vente"
                                  : m.reason === "internal_use"
                                    ? "Interne"
                                    : "Dégradé"}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-12 text-sm text-gray-400">
                    Sélectionnez une période pour voir les mouvements
                  </div>
                )}
              </div>
            </div>
          </ComponentCard>
        </div>
      </div>
    </>
  );
}
