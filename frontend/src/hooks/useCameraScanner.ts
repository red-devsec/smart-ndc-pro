import { useCallback, useEffect, useRef, useState } from "react";

// Minimal BarcodeDetector type (not yet in TS DOM lib by default)
type BarcodeFormat = "ean_13" | "code_128" | "qr_code" | "ean_8" | "upc_a" | "upc_e";
interface DetectedBarcode {
  rawValue: string;
  format: BarcodeFormat;
  boundingBox: DOMRectReadOnly;
}
interface BarcodeDetectorCtor {
  new (opts?: { formats?: BarcodeFormat[] }): {
    detect: (source: CanvasImageSource) => Promise<DetectedBarcode[]>;
  };
};
declare global {
  interface Window { BarcodeDetector?: BarcodeDetectorCtor; }
}

export interface CameraScannerOptions {
  formats?: BarcodeFormat[];
  onDetected?: (value: string, format: string) => void;
}

/**
 * Camera barcode scanner using the native BarcodeDetector API when available,
 * with a fallback message otherwise. Supports EAN-13, Code 128, QR Code.
 */
export function useCameraScanner(opts: CameraScannerOptions = {}) {
  const { formats = ["ean_13", "code_128", "qr_code"], onDetected } = opts;
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const detectorRef = useRef<InstanceType<BarcodeDetectorCtor> | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastValueRef = useRef<string>("");
  const lastTimeRef = useRef<number>(0);
  const [active, setActive] = useState(false);
  const [supported, setSupported] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const cbRef = useRef(onDetected);
  cbRef.current = onDetected;

  useEffect(() => {
    if (typeof window !== "undefined" && "BarcodeDetector" in window) {
      setSupported(true);
    }
  }, []);

  const stop = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    setActive(false);
  }, []);

  const tick = useCallback(async () => {
    const video = videoRef.current;
    const detector = detectorRef.current;
    if (!video || !detector || video.readyState < 2) {
      rafRef.current = requestAnimationFrame(tick);
      return;
    }
    try {
      const barcodes = await detector.detect(video);
      if (barcodes.length > 0) {
        const now = Date.now();
        const val = barcodes[0].rawValue;
        if (val !== lastValueRef.current || now - lastTimeRef.current > 2000) {
          lastValueRef.current = val;
          lastTimeRef.current = now;
          cbRef.current?.(val, barcodes[0].format);
        }
      }
    } catch {
      // ignore transient detect errors
    }
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  const start = useCallback(async () => {
    setError(null);
    if (!("BarcodeDetector" in window)) {
      setError("BarcodeDetector non supporté par ce navigateur. Utilisez Chrome/Edge ou la saisie manuelle.");
      return;
    }
    try {
      // @ts-expect-error - BarcodeDetector is a global, not typed in TS lib
      detectorRef.current = new window.BarcodeDetector({ formats });
    } catch (e: any) {
      setError("Formats non supportés: " + (e?.message || e));
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setActive(true);
      rafRef.current = requestAnimationFrame(tick);
    } catch (e: any) {
      setError("Accès caméra refusé: " + (e?.message || e));
    }
  }, [formats, tick]);

  useEffect(() => () => stop(), [stop]);

  return { videoRef, start, stop, active, supported, error };
}