import { useState, useEffect, useRef, useCallback } from "react";
import { useAppStore } from "../../store/appStore";
import { generateId } from "../../utils/id";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import Button from "../../components/ui/button/Button";
import Input from "../../components/form/input/InputField";
import Label from "../../components/form/Label";
import Badge from "../../components/ui/badge/Badge";
import { Modal } from "../../components/ui/modal";
import { BoxIconLine, ArrowUpIcon, ArrowDownIcon, CheckCircleIcon } from "../../icons";
import { useKeyboardWedge } from "../../hooks/useKeyboardWedge";
import { useCameraScanner } from "../../hooks/useCameraScanner";

interface ScanEntry {
  barcode: string;
  productName: string;
  type: "in" | "out";
  quantity: number;
  timestamp: Date;
}

export default function BarcodeScanPage() {
  const { products, employees, currentUser, addStockMovement } = useAppStore();
  const [manualBarcode, setManualBarcode] = useState("");
  const [foundProduct, setFoundProduct] = useState<typeof products[0] | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [showAction, setShowAction] = useState<"in" | "out" | null>(null);
  const [actionQty, setActionQty] = useState("1");
  const [scanHistory, setScanHistory] = useState<ScanEntry[]>([]);
  const [successMsg, setSuccessMsg] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  // ── Scanner USB (keyboard wedge) ──
  const lookupBarcode = useCallback((code: string) => {
    const trimmed = code.trim();
    if (!trimmed) return;

    const product = products.find((p) => p.barcode === trimmed);
    if (product) {
      setFoundProduct(product);
      setNotFound(false);
      setShowAction(null);
    } else {
      setFoundProduct(null);
      setNotFound(true);
    }
    setManualBarcode("");
  }, [products]);

  useKeyboardWedge({
    onScan: (result) => lookupBarcode(result.data),
    inputRef,
    continuous: true, // mode supermarché : toujours prêt à scanner
  });

  // ── Scanner caméra (BarcodeDetector API: EAN-13, Code 128, QR Code) ──
  const camera = useCameraScanner({
    formats: ["ean_13", "code_128", "qr_code"],
    onDetected: (value) => lookupBarcode(value),
  });
  const [cameraMode, setCameraMode] = useState(false);
  const toggleCamera = async () => {
    if (cameraMode) {
      camera.stop();
      setCameraMode(false);
    } else {
      await camera.start();
      setCameraMode(true);
    }
  };

  // Focus l'input au montage
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    lookupBarcode(manualBarcode);
  };

  const handleActionConfirm = () => {
    if (!foundProduct || !showAction) return;

    const qty = parseInt(actionQty) || 1;
    const employee = employees.find(
      (e) => e.email === currentUser?.email
    ) ?? employees[0];

    const movement = {
      id: generateId(),
      productId: foundProduct.id,
      productName: foundProduct.name,
      productBarcode: foundProduct.barcode,
      type: showAction,
      reason: showAction === "in" ? "replenishment" as const : "sale" as const,
      quantity: qty,
      employeeId: employee.id,
      employeeName: `${employee.firstName} ${employee.lastName}`,
      timestamp: new Date().toISOString(),
      notes: "Scan code-barres",
    };

    addStockMovement(movement);

    setScanHistory((prev) => [
      {
        barcode: foundProduct.barcode,
        productName: foundProduct.name,
        type: showAction,
        quantity: qty,
        timestamp: new Date(),
      },
      ...prev,
    ]);

    setSuccessMsg(`${showAction === "in" ? "Entrée" : "Sortie"} de ${qty} x ${foundProduct.name} enregistrée`);
    setShowAction(null);
    setActionQty("1");
    setFoundProduct(null);

    setTimeout(() => setSuccessMsg(""), 3000);
  };

  return (
    <>
      <PageMeta
        title="Scan Code-Barres - SMART NDC"
        description="Scanner et gérer les produits par code-barres"
      />
      <PageBreadcrumb pageTitle="Scan Code-Barres" />

      {successMsg && (
        <div className="mb-4 flex items-center gap-3 rounded-lg border border-success-200 bg-success-50 px-4 py-3 text-sm text-success-700 dark:border-success-800 dark:bg-success-500/10 dark:text-success-400">
          <CheckCircleIcon className="h-5 w-5" />
          {successMsg}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <ComponentCard title="Scanner">
            <div className="flex flex-col items-center gap-6">
              <div className="relative flex h-56 w-full max-w-sm items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-brand-500 bg-gray-50 dark:bg-gray-900">
                {cameraMode ? (
                  <video
                    ref={camera.videoRef}
                    className="h-full w-full object-cover"
                    muted
                    playsInline
                  />
                ) : (
                  <>
                    <div className="absolute inset-0 animate-pulse rounded-2xl border-2 border-brand-300 opacity-50" />
                    <div className="relative z-10 flex flex-col items-center gap-2">
                      <BoxIconLine className="h-12 w-12 text-brand-500" />
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Scannez avec le lecteur USB ou la webcam
                      </p>
                      <span className="text-xs text-gray-400">
                        Le champ ci-dessous est automatiquement ciblé
                      </span>
                    </div>
                    <div className="absolute left-1/2 top-0 h-full w-0.5 -translate-x-1/2 bg-brand-400/30" />
                  </>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={toggleCamera}
                  variant={cameraMode ? "primary" : "outline"}
                  type="button"
                >
                  {cameraMode ? "Arrêter caméra" : "Démarrer caméra"}
                </Button>
              </div>
              {camera.error && (
                <p className="text-xs text-error-600">{camera.error}</p>
              )}
              {!camera.supported && !camera.error && (
                <p className="text-xs text-gray-400">
                  Caméra (BarcodeDetector) non supportée — utilisez Chrome/Edge ou la saisie manuelle.
                </p>
              )}

              <form onSubmit={handleSubmit} className="w-full max-w-sm">
                <Label htmlFor="barcodeInput">Code-barres (saisie manuelle)</Label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Input
                      id="barcodeInput"
                      ref={inputRef as any}
                      placeholder="Scannez ou tapez le code..."
                      value={manualBarcode}
                      onChange={(e) => setManualBarcode(e.target.value)}
                    />
                  </div>
                  <Button onClick={() => lookupBarcode(manualBarcode)} type="button">
                    OK
                  </Button>
                </div>
              </form>
            </div>
          </ComponentCard>

          {notFound && (
            <div className="rounded-lg border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-700 dark:border-error-800 dark:bg-error-500/10 dark:text-error-400">
              Aucun produit trouvé avec ce code-barres. Vérifiez le code et réessayez.
            </div>
          )}

          {foundProduct && (
            <ComponentCard title="Produit scanné">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800">
                    <BoxIconLine className="h-8 w-8 text-gray-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                      {foundProduct.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {foundProduct.category}
                    </p>
                  </div>
                </div>

                <div className="rounded-xl bg-gray-50 p-4 dark:bg-gray-900">
                  <p className="mb-1 text-center font-mono text-2xl tracking-widest text-gray-800 dark:text-white/90">
                    {foundProduct.barcode}
                  </p>
                  <p className="text-center text-xs text-gray-500 dark:text-gray-400">
                    {foundProduct.barcodeFormat}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Stock actuel</p>
                    <p className={`text-xl font-bold ${
                      foundProduct.quantity === 0
                        ? "text-error-500"
                        : foundProduct.quantity <= foundProduct.minThreshold
                          ? "text-warning-600"
                          : "text-success-600"
                    }`}>
                      {foundProduct.quantity}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Prix</p>
                    <p className="text-xl font-bold text-gray-800 dark:text-white/90">
                      {foundProduct.price.toLocaleString()} MAD
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Seuil</p>
                    <p className="text-xl font-bold text-gray-800 dark:text-white/90">
                      {foundProduct.minThreshold}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    className="flex-1"
                    onClick={() => {
                      setShowAction("out");
                      setActionQty("1");
                    }}
                    startIcon={<ArrowUpIcon />}
                  >
                    Sortie
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={() => {
                      setShowAction("in");
                      setActionQty("1");
                    }}
                    startIcon={<ArrowDownIcon />}
                  >
                    Entrée
                  </Button>
                </div>
              </div>
            </ComponentCard>
          )}
        </div>

        <div className="space-y-6">
          <ComponentCard title="Historique de la session">
            {scanHistory.length === 0 ? (
              <p className="py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                Aucun scan pour le moment
              </p>
            ) : (
              <div className="space-y-3">
                {scanHistory.map((entry, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-lg border border-gray-100 px-4 py-3 dark:border-gray-800"
                  >
                    <div className="flex items-center gap-3">
                      <Badge
                        variant="light"
                        color={entry.type === "in" ? "success" : "error"}
                        size="sm"
                      >
                        {entry.type === "in" ? "IN" : "OUT"}
                      </Badge>
                      <div>
                        <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                          {entry.productName}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {entry.barcode}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-800 dark:text-white/90">
                        x{entry.quantity}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {entry.timestamp.toLocaleTimeString("fr-FR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ComponentCard>
        </div>
      </div>

      <Modal isOpen={showAction !== null} onClose={() => setShowAction(null)}>
        <div className="px-6 py-8 text-center sm:px-10">
          <div className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full ${
            showAction === "in"
              ? "bg-success-50 dark:bg-success-500/15"
              : "bg-error-50 dark:bg-error-500/15"
          }`}>
            {showAction === "in" ? (
              <ArrowDownIcon className={`h-6 w-6 ${showAction === "in" ? "text-success-500" : "text-error-500"}`} />
            ) : (
              <ArrowUpIcon className="h-6 w-6 text-error-500" />
            )}
          </div>
          <h3 className="mb-1 text-lg font-semibold text-gray-800 dark:text-white/90">
            {showAction === "in" ? "Entrée en stock" : "Sortie de stock"}
          </h3>
          <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
            {foundProduct?.name}
          </p>
          <div className="mx-auto max-w-[120px]">
            <Label htmlFor="actionQty">Quantité</Label>
            <Input
              id="actionQty"
              type="number"
              min="1"
              value={actionQty}
              onChange={(e) => setActionQty(e.target.value)}
            />
          </div>
          <div className="mt-6 flex items-center justify-center gap-3">
            <Button variant="outline" onClick={() => setShowAction(null)}>
              Annuler
            </Button>
            <Button onClick={handleActionConfirm}>
              Confirmer
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
