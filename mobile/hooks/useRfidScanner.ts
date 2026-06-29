import { useState, useEffect, useCallback, useRef } from "react";

interface RfidTag {
  id: string;
  ndefMessage?: { type: string; payload: string; tnf: number }[];
  techTypes?: string[];
}

interface UseRfidScannerOptions {
  onTagRead?: (tag: RfidTag) => void;
}

export function useRfidScanner(options: UseRfidScannerOptions = {}) {
  const { onTagRead } = options;
  const [isScanning, setIsScanning] = useState(false);
  const [isSupported, setIsSupported] = useState<boolean | null>(null);
  const [lastTag, setLastTag] = useState<RfidTag | null>(null);
  const scanningRef = useRef(false);

  // Initialize NFC manager
  useEffect(() => {
    let mounted = true;

    async function init() {
      try {
        const NfcManager = require("react-native-nfc-manager").default;

        // Start NFC
        await NfcManager.start();

        // Check if NFC is supported
        const supported = await NfcManager.isSupported();
        if (mounted) setIsSupported(supported);

        if (supported) {
          // Register the tag discovery listener
          NfcManager.setEventListener(NfcManager.Event.TagDiscovered, (tag: any) => {
            if (mounted) {
              const rfidTag: RfidTag = {
                id: tag.id,
                ndefMessage: tag.ndefMessage?.map((msg: any) => ({
                  type: msg.type,
                  payload: msg.payload,
                  tnf: msg.tnf,
                })),
                techTypes: tag.techTypes,
              };
              setLastTag(rfidTag);
              onTagRead?.(rfidTag);
            }
          });
        }
      } catch (e) {
        if (mounted) setIsSupported(false);
      }
    }

    init();

    return () => {
      mounted = false;
      try {
        const NfcManager = require("react-native-nfc-manager").default;
        NfcManager.setEventListener(NfcManager.Event.TagDiscovered, null);
      } catch {}
    };
  }, []);

  const startScanning = useCallback(async () => {
    if (scanningRef.current) return;
    scanningRef.current = true;
    setIsScanning(true);

    try {
      const { NfcTech } = require("react-native-nfc-manager");
      const NfcManager = require("react-native-nfc-manager").default;

      await NfcManager.requestTechnology(NfcTech.Ndef, {
        alertMessage: "Approchez le badge RFID du téléphone",
      });
    } catch (ex: any) {
      // User cancelled or timeout
      if (ex?.message?.includes("cancel")) {
        // Normal cancellation
      }
    } finally {
      scanningRef.current = false;
      setIsScanning(false);
    }
  }, []);

  const stopScanning = useCallback(async () => {
    try {
      const NfcManager = require("react-native-nfc-manager").default;
      await NfcManager.cancelTechnologyRequest();
    } catch {}
    scanningRef.current = false;
    setIsScanning(false);
  }, []);

  const readRfidTag = useCallback(async () => {
    try {
      const { NfcTech } = require("react-native-nfc-manager");
      const NfcManager = require("react-native-nfc-manager").default;

      setIsScanning(true);
      await NfcManager.requestTechnology(NfcTech.Ndef);

      const tag = await NfcManager.getTag();
      const rfidTag: RfidTag = {
        id: tag.id,
        ndefMessage: tag.ndefMessage?.map((msg: any) => ({
          type: msg.type,
          payload: msg.payload,
          tnf: msg.tnf,
        })),
        techTypes: tag.techTypes,
      };

      setLastTag(rfidTag);
      onTagRead?.(rfidTag);
      return rfidTag;
    } catch (ex: any) {
      if (ex?.message?.includes("cancel")) {
        // User cancelled
      }
      return null;
    } finally {
      await stopScanning();
      setIsScanning(false);
    }
  }, [onTagRead, stopScanning]);

  return {
    isScanning,
    isSupported,
    lastTag,
    startScanning,
    stopScanning,
    readRfidTag,
  };
}
