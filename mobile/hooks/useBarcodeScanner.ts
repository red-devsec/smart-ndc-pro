import { useState, useRef, useCallback } from "react";
import {
  CameraView,
  useCameraPermissions,
  BarcodeScanningResult,
  BarcodeType,
} from "expo-camera";

export interface BarcodeResult {
  type: string;
  data: string;
}

interface UseBarcodeScannerOptions {
  onBarcodeScanned?: (result: BarcodeResult) => void;
  barcodeTypes?: BarcodeType[];
}

export function useBarcodeScanner(options: UseBarcodeScannerOptions = {}) {
  const { onBarcodeScanned, barcodeTypes } = options;
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const scannedRef = useRef(scanned);
  scannedRef.current = scanned;

  const handleBarcodeScanned = useCallback(
    (result: BarcodeScanningResult) => {
      if (scannedRef.current) return;
      setScanned(true);
      onBarcodeScanned?.({
        type: result.type,
        data: result.data,
      });
    },
    [onBarcodeScanned]
  );

  const resetScan = useCallback(() => {
    setScanned(false);
  }, []);

  const toggleTorch = useCallback(() => {
    setTorchOn((prev) => !prev);
  }, []);

  return {
    permission,
    requestPermission,
    scanned,
    torchOn,
    handleBarcodeScanned,
    resetScan,
    toggleTorch,
    CameraView,
    barcodeScannerSettings: {
      barcodeTypes: barcodeTypes ?? (["qr", "ean13", "ean8", "code128", "code39", "code93", "codabar", "itf14", "upc_a", "upc_e"] as BarcodeType[]),
    },
  };
}
