import { useState, useMemo } from "react";
import { useSearchParams } from "react-router";
import { useAppStore } from "../../store/appStore";
import { generateId } from "../../utils/id";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import Button from "../../components/ui/button/Button";
import Input from "../../components/form/input/InputField";
import Select from "../../components/form/Select";
import Label from "../../components/form/Label";
import Badge from "../../components/ui/badge/Badge";
import { Modal } from "../../components/ui/modal";
import { PlusIcon } from "../../icons";

const reasonLabels: Record<string, string> = {
  replenishment: "Réapprovisionnement",
  sale: "Vente",
  internal_use: "Usage interne",
  damaged: "Endommagé",
};

export default function StockMovements() {
  const { stockMovements, products, employees, currentUser, addStockMovement } = useAppStore();
  const [searchParams] = useSearchParams();
  const productFilter = searchParams.get("product") || "";

  const [typeFilter, setTypeFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [employeeFilter, setEmployeeFilter] = useState("");
  const [showForm, setShowForm] = useState(false);

  const [formProductId, setFormProductId] = useState(productFilter || "");
  const [formType, setFormType] = useState("out");
  const [formReason, setFormReason] = useState("sale");
  const [formQty, setFormQty] = useState("1");
  const [formNotes, setFormNotes] = useState("");

  const filtered = useMemo(() => {
    return stockMovements.filter((m) => {
      if (productFilter && m.productId !== productFilter) return false;
      if (typeFilter && m.type !== typeFilter) return false;
      if (employeeFilter && m.employeeId !== employeeFilter) return false;
      if (dateFrom && m.timestamp < dateFrom) return false;
      if (dateTo) {
        const end = new Date(dateTo);
        end.setDate(end.getDate() + 1);
        if (new Date(m.timestamp) > end) return false;
      }
      return true;
    });
  }, [stockMovements, productFilter, typeFilter, employeeFilter, dateFrom, dateTo]);

  const runningTotal = useMemo(() => {
    const map: Record<string, number> = {};
    stockMovements.forEach((m) => {
      if (!map[m.productId]) map[m.productId] = 0;
      map[m.productId] += m.type === "in" ? m.quantity : -m.quantity;
    });
    return map;
  }, [stockMovements]);

  const typeOptions = [
    { value: "", label: "Tous les types" },
    { value: "in", label: "Entrée" },
    { value: "out", label: "Sortie" },
  ];

  const employeeOptions = [
    { value: "", label: "Tous les employés" },
    ...employees.map((e) => ({
      value: e.id,
      label: `${e.firstName} ${e.lastName}`,
    })),
  ];

  const productOptions = products.map((p) => ({
    value: p.id,
    label: `${p.name} (${p.barcode})`,
  }));

  const reasonOptions = [
    { value: "replenishment", label: "Réapprovisionnement" },
    { value: "sale", label: "Vente" },
    { value: "internal_use", label: "Usage interne" },
    { value: "damaged", label: "Endommagé" },
  ];

  const handleAddMovement = () => {
    const product = products.find((p) => p.id === formProductId);
    if (!product || !formQty) return;

    const employee = employees.find(
      (e) => e.email === currentUser?.email
    ) ?? employees[0];

    const movement = {
      id: generateId(),
      productId: formProductId,
      productName: product.name,
      productBarcode: product.barcode,
      type: formType as "in" | "out",
      reason: formReason as "replenishment" | "sale" | "internal_use" | "damaged",
      quantity: parseInt(formQty) || 1,
      employeeId: employee.id,
      employeeName: `${employee.firstName} ${employee.lastName}`,
      timestamp: new Date().toISOString(),
      notes: formNotes || undefined,
    };

    addStockMovement(movement);
    setFormProductId("");
    setFormType("out");
    setFormReason("sale");
    setFormQty("1");
    setFormNotes("");
    setShowForm(false);
  };

  const formatDate = (ts: string) =>
    new Date(ts).toLocaleString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <>
      <PageMeta
        title="Mouvements de Stock - SMART NDC"
        description="Gestion des mouvements de stock"
      />
      <PageBreadcrumb pageTitle="Mouvements de Stock" />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="w-40">
            <Select
              options={typeOptions}
              placeholder="Type"
              defaultValue={typeFilter}
              onChange={setTypeFilter}
            />
          </div>
          <div className="w-44">
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              placeholder="Date début"
            />
          </div>
          <div className="w-44">
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              placeholder="Date fin"
            />
          </div>
          <div className="w-48">
            <Select
              options={employeeOptions}
              placeholder="Employé"
              defaultValue={employeeFilter}
              onChange={setEmployeeFilter}
            />
          </div>
        </div>
        <Button onClick={() => setShowForm(true)} startIcon={<PlusIcon />}>
          Nouveau Mouvement
        </Button>
      </div>

      <ComponentCard title="Mouvements">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800">
                <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Date/Heure</th>
                <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Produit</th>
                <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Code-barres</th>
                <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Type</th>
                <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Raison</th>
                <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Qté</th>
                <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Solde</th>
                <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Employé</th>
                <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Notes</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((m) => (
                <tr
                  key={m.id}
                  className="border-b border-gray-100 dark:border-gray-800"
                >
                  <td className="whitespace-nowrap px-4 py-3 text-gray-600 dark:text-gray-400">
                    {formatDate(m.timestamp)}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-800 dark:text-white/90">
                    {m.productName}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-600 dark:text-gray-400">
                    {m.productBarcode}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant="light"
                      color={m.type === "in" ? "success" : "error"}
                      size="sm"
                    >
                      {m.type === "in" ? "Entrée" : "Sortie"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                    {reasonLabels[m.reason] ?? m.reason}
                  </td>
                  <td className="px-4 py-3 font-semibold">
                    <span
                      className={
                        m.type === "in"
                          ? "text-success-600"
                          : "text-error-600"
                      }
                    >
                      {m.type === "in" ? "+" : "-"}
                      {m.quantity}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-semibold text-gray-800 dark:text-white/90">
                    {runningTotal[m.productId] ?? 0}
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                    {m.employeeName}
                  </td>
                  <td className="max-w-[150px] truncate px-4 py-3 text-gray-500 dark:text-gray-400">
                    {m.notes || "-"}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                    Aucun mouvement trouvé
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </ComponentCard>

      <Modal isOpen={showForm} onClose={() => setShowForm(false)}>
        <div className="px-6 py-8 sm:px-10">
          <h3 className="mb-6 text-lg font-semibold text-gray-800 dark:text-white/90">
            Nouveau Mouvement de Stock
          </h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="formProduct">Produit</Label>
              <Select
                options={productOptions}
                placeholder="Rechercher un produit..."
                defaultValue={formProductId}
                onChange={setFormProductId}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="formType">Type</Label>
                <Select
                  options={[
                    { value: "in", label: "Entrée" },
                    { value: "out", label: "Sortie" },
                  ]}
                  placeholder="Type"
                  defaultValue={formType}
                  onChange={setFormType}
                />
              </div>
              <div>
                <Label htmlFor="formReason">Raison</Label>
                <Select
                  options={reasonOptions}
                  placeholder="Raison"
                  defaultValue={formReason}
                  onChange={setFormReason}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="formQty">Quantité</Label>
              <Input
                id="formQty"
                type="number"
                min="1"
                placeholder="1"
                value={formQty}
                onChange={(e) => setFormQty(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="formNotes">Notes (optionnel)</Label>
              <Input
                id="formNotes"
                placeholder="Notes additionnelles..."
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
              />
            </div>
          </div>
          <div className="mt-6 flex items-center justify-end gap-3">
            <Button variant="outline" onClick={() => setShowForm(false)}>
              Annuler
            </Button>
            <Button
              onClick={handleAddMovement}
              disabled={!formProductId || !formQty}
            >
              Confirmer
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
