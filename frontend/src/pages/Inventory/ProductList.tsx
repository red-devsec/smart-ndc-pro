import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { useAppStore } from "../../store/appStore";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import Button from "../../components/ui/button/Button";
import Input from "../../components/form/input/InputField";
import Select from "../../components/form/Select";
import Badge from "../../components/ui/badge/Badge";
import { Modal } from "../../components/ui/modal";
import {
  PencilIcon,
  TrashBinIcon,
  EyeIcon,
  PlusIcon,
  BoxIconLine,
} from "../../icons";
import { useKeyboardWedge } from "../../hooks/useKeyboardWedge";

export default function ProductList() {
  const { products, categories, deleteProduct } = useAppStore();
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [scanHighlight, setScanHighlight] = useState<string | null>(null);
  const scanInputRef = useRef<HTMLInputElement | null>(null);

  // ── Scanner USB : scan → cherche le produit ──
  useKeyboardWedge({
    onScan: useCallback(({ data }: { data: string }) => {
      setSearch(data);
      setScanHighlight(data);
      setTimeout(() => setScanHighlight(null), 3000);
    }, []),
    inputRef: scanInputRef,
    continuous: true,
  });

  // Focus le champ scan au montage
  useEffect(() => {
    scanInputRef.current?.focus();
  }, []);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        !search ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.barcode.includes(search);
      const matchesCategory = !categoryFilter || p.categoryId === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [products, search, categoryFilter]);

  const categoryOptions = [
    { value: "", label: "Toutes les catégories" },
    ...categories.map((c) => ({ value: c.id, label: c.name })),
  ];

  const stockBadge = (qty: number, threshold: number) => {
    if (qty === 0) return { color: "error" as const, label: "Rupture" };
    if (qty <= threshold) return { color: "warning" as const, label: "Stock bas" };
    return { color: "success" as const, label: "OK" };
  };

  const rowBg = (qty: number, threshold: number) => {
    if (qty === 0) return "bg-error-50 dark:bg-error-500/10";
    if (qty <= threshold) return "bg-warning-50 dark:bg-warning-500/10";
    return "";
  };

  return (
    <>
      <PageMeta
        title="Gestion des Produits - SMART NDC"
        description="Liste et gestion des produits"
      />
      <PageBreadcrumb pageTitle="Gestion des Produits" />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-60">
            <Input
              ref={scanInputRef as any}
              placeholder="Scannez ou recherchez..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {scanHighlight && (
              <span className="absolute -right-2 -top-2 flex h-5 items-center rounded-full bg-success-500 px-2 text-[10px] font-semibold text-white">
                Scan
              </span>
            )}
          </div>
          <div className="w-48">
            <Select
              options={categoryOptions}
              placeholder="Catégorie"
              defaultValue={categoryFilter}
              onChange={setCategoryFilter}
            />
          </div>
        </div>
        <Button
          onClick={() => navigate("/products/new")}
          startIcon={<PlusIcon />}
        >
          Ajouter Produit
        </Button>
      </div>

      <ComponentCard title="Produits">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800">
                <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Image</th>
                <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Nom</th>
                <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Catégorie</th>
                <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Code-barres</th>
                <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Prix</th>
                <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Qté</th>
                <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Emplacement</th>
                <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Statut</th>
                <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => {
                const badge = stockBadge(p.quantity, p.minThreshold);
                return (
                  <tr
                    key={p.id}
                    className={`border-b border-gray-100 dark:border-gray-800 ${rowBg(p.quantity, p.minThreshold)} ${
                      scanHighlight === p.barcode ? "animate-pulse bg-brand-50 dark:bg-brand-500/20" : ""
                    }`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
                        <BoxIconLine className="text-gray-400" />
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-800 dark:text-white/90">
                      {p.name}
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                      {p.category}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-600 dark:text-gray-400">
                      {p.barcode}
                    </td>
                    <td className="px-4 py-3 text-gray-800 dark:text-white/90">
                      {p.price.toLocaleString()} MAD
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`font-semibold ${
                          p.quantity === 0
                            ? "text-error-500"
                            : p.quantity <= p.minThreshold
                              ? "text-warning-600"
                              : "text-success-600"
                        }`}
                      >
                        {p.quantity}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                      {p.location}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="light" color={badge.color} size="sm">
                        {badge.label}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => navigate(`/products/edit/${p.id}`)}
                          className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-brand-500 dark:hover:bg-gray-800"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(p.id)}
                          className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-error-500 dark:hover:bg-gray-800"
                        >
                          <TrashBinIcon className="h-4 w-4" />
                        </button>
                        <Link
                          to={`/stock-movements?product=${p.id}`}
                          className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-blue-light-500 dark:hover:bg-gray-800"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                    Aucun produit trouvé
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </ComponentCard>

      <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)}>
        <div className="px-6 py-8 text-center sm:px-10">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-error-50 dark:bg-error-500/15">
            <TrashBinIcon className="h-6 w-6 text-error-500" />
          </div>
          <h3 className="mb-2 text-lg font-semibold text-gray-800 dark:text-white/90">
            Confirmer la suppression
          </h3>
          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
            Êtes-vous sûr de vouloir supprimer ce produit ? Cette action est irréversible.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Button
              variant="outline"
              onClick={() => setDeleteConfirm(null)}
            >
              Annuler
            </Button>
            <Button
              onClick={() => {
                if (deleteConfirm) {
                  deleteProduct(deleteConfirm);
                  setDeleteConfirm(null);
                }
              }}
            >
              Supprimer
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
