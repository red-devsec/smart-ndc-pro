import { useState, useEffect, useCallback, useRef } from "react";
import { Platform } from "react-native";

interface ZebraScanResult {
  data: string;
  symbology?: string;
  timestamp?: number;
}

interface UseZebraScannerOptions {
  onBarcodeScanned?: (result: ZebraScanResult) => void;
}

/**
 * Hook for integrating with Zebra enterprise devices barcode scanner.
 *
 * Two strategies are tried:
 * 1. @nextup/react-native-zebra-scanner (EMDK-based, newer)
 * 2. react-native-datawedge-intents (DataWedge Intent API, fallback)
 *
 * On non-Zebra devices, the hook reports isAvailable = false
 * so the app can fall back to camera-based scanning.
 */
export function useZebraScanner(options: UseZebraScannerOptions = {}) {
  const { onBarcodeScanned } = options;
  const [isAvailable, setIsAvailable] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scannerType, setScannerType] = useState<"emdk" | "datawedge" | null>(null);
  const listenerRef = useRef<any>(null);

  useEffect(() => {
    if (Platform.OS !== "android") {
      setIsAvailable(false);
      return;
    }

    let mounted = true;
    let cleanup: (() => void) | null = null;

    async function initZebra() {
      // Strategy 1: Try @nextup/react-native-zebra-scanner (EMDK)
      try {
        const ZebraScanner = require("@nextup/react-native-zebra-scanner");
        if (ZebraScanner && ZebraScanner.default) {
          const claimed = await ZebraScanner.default.startReader();
          if (mounted && claimed) {
            setIsAvailable(true);
            setScannerType("emdk");

            const handler = (event: any) => {
              const result: ZebraScanResult = {
                data: event.data || event.barcode || "",
                symbology: event.symbology || event.symbol || "",
                timestamp: Date.now(),
              };
              onBarcodeScanned?.(result);
            };

            ZebraScanner.default.on("barcodeReadSuccess", handler);
            listenerRef.current = () => {
              ZebraScanner.default.off("barcodeReadSuccess", handler);
              ZebraScanner.default.stopReader();
            };
            return;
          }
        }
      } catch {
        // EMDK not available, try DataWedge
      }

      // Strategy 2: Try react-native-datawedge-intents (DataWedge)
      try {
        const DataWedgeIntents = require("react-native-datawedge-intents");
        if (DataWedgeIntents) {
          DataWedgeIntents.registerReceiver(
            "com.zebra.dwintents.ACTION",
            ""
          );
          if (mounted) {
            setIsAvailable(true);
            setScannerType("datawedge");

            const { DeviceEventEmitter } = require("react-native");
            const handler = (event: any) => {
              const result: ZebraScanResult = {
                data: event.data || event.scanData || event.text || "",
                symbology: event.symbology || event.labelType || "",
                timestamp: Date.now(),
              };
              onBarcodeScanned?.(result);
            };

            DeviceEventEmitter.addListener("barcode_scan", handler);
            listenerRef.current = () => {
              DeviceEventEmitter.removeListener("barcode_scan", handler);
            };
            return;
          }
        }
      } catch {
        // DataWedge not available either
        if (mounted) setIsAvailable(false);
      }
    }

    initZebra();

    return () => {
      mounted = false;
      listenerRef.current?.();
      listenerRef.current = null;
    };
  }, [onBarcodeScanned]);

  const startScanning = useCallback(async () => {
    if (!isAvailable) return;
    setIsScanning(true);

    try {
      if (scannerType === "emdk") {
        const ZebraScanner = require("@nextup/react-native-zebra-scanner");
        await ZebraScanner.default.startReader();
      } else if (scannerType === "datawedge") {
        const DataWedgeIntents = require("react-native-datawedge-intents");
        DataWedgeIntents.sendIntent(
          DataWedgeIntents.ACTION_SOFTSCANTRIGGER,
          DataWedgeIntents.START_SCANNING
        );
      }
    } catch {}
  }, [isAvailable, scannerType]);

  const stopScanning = useCallback(async () => {
    setIsScanning(false);

    try {
      if (scannerType === "emdk") {
        const ZebraScanner = require("@nextup/react-native-zebra-scanner");
        await ZebraScanner.default.stopReader();
      } else if (scannerType === "datawedge") {
        const DataWedgeIntents = require("react-native-datawedge-intents");
        DataWedgeIntents.sendIntent(
          DataWedgeIntents.ACTION_SOFTSCANTRIGGER,
          DataWedgeIntents.STOP_SCANNING
        );
      }
    } catch {}
  }, [scannerType]);

  return {
    isAvailable,
    isScanning,
    scannerType,
    startScanning,
    stopScanning,
  };
}
