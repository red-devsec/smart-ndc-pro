import { useEffect, useRef } from "react";

interface ScanResult {
  data: string;
}

interface UseKeyboardWedgeOptions {
  onScan?: (result: ScanResult) => void;
  /** Ref de l'input à auto-focus */
  inputRef?: React.RefObject<HTMLInputElement | null>;
  /** Mode continu : re-focus l'input après chaque scan (défaut: true) */
  continuous?: boolean;
}

const SCAN_INTERVAL = 60; // ms max entre 2 frappes pour détecter un scanner

/**
 * Support des scanners USB de caisse (keyboard wedge).
 *
 * Ces scanners se branchent en USB, sont reconnus comme un clavier,
 * et "tapent" le code-barres très rapidement suivi de la touche Enter.
 *
 * Aucun pilote nécessaire — le navigateur reçoit juste des événements clavier.
 */
export function useKeyboardWedge(options: UseKeyboardWedgeOptions = {}) {
  const { onScan, inputRef, continuous = true } = options;
  const bufferRef = useRef("");
  const lastTimeRef = useRef(0);

  useEffect(() => {
    let cancelTimeout: ReturnType<typeof setTimeout>;

    const handler = (e: KeyboardEvent) => {
      const now = Date.now();
      const isScanner = (now - lastTimeRef.current) < SCAN_INTERVAL;

      // Si un scanner "tape", on focus l'input automatiquement
      if (isScanner && bufferRef.current.length > 0 && inputRef?.current && document.activeElement !== inputRef.current) {
        inputRef.current.focus();
      }

      if (e.key === "Enter") {
        const code = bufferRef.current.trim();
        if (code) {
          onScan?.({ data: code });

          // En mode continu, re-focus après le scan
          if (continuous && inputRef?.current) {
            setTimeout(() => inputRef.current?.focus(), 50);
          }
        }
        bufferRef.current = "";
        lastTimeRef.current = now;
        return;
      }

      // Ignorer touches de contrôle
      if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
        bufferRef.current += e.key;
        lastTimeRef.current = now;

        // Reset buffer si tapé trop lentement (saisie manuelle)
        clearTimeout(cancelTimeout);
        cancelTimeout = setTimeout(() => {
          bufferRef.current = "";
        }, 150);
      }
    };

    window.addEventListener("keydown", handler);
    return () => {
      window.removeEventListener("keydown", handler);
      clearTimeout(cancelTimeout);
    };
  }, [onScan, inputRef, continuous]);
}
