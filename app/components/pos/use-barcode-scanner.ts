"use client";

import { useEffect, useRef } from "react";
import { isEditableTarget } from "./keyboard-target";

const BARCODE_MIN_LENGTH = 4;
const BARCODE_MAX_INTERVAL_MS = 45;
const BARCODE_FLUSH_DELAY_MS = 120;
const BARCODE_VALID_CHARACTER = /^[a-zA-Z0-9._-]$/;

type BarcodeScannerOptions = {
  disabled?: boolean;
  onScan: (code: string) => void;
};

export function useBarcodeScanner({ disabled = false, onScan }: BarcodeScannerOptions) {
  const onScanRef = useRef(onScan);
  const bufferRef = useRef("");
  const lastKeyAtRef = useRef(0);
  const flushTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    onScanRef.current = onScan;
  }, [onScan]);

  useEffect(() => {
    function clearBuffer() {
      bufferRef.current = "";
      lastKeyAtRef.current = 0;
      if (flushTimerRef.current) {
        clearTimeout(flushTimerRef.current);
        flushTimerRef.current = null;
      }
    }

    function emitScan() {
      const code = bufferRef.current;
      clearBuffer();
      if (code.length >= BARCODE_MIN_LENGTH) {
        onScanRef.current(code);
      }
    }

    function scheduleFlush() {
      if (flushTimerRef.current) clearTimeout(flushTimerRef.current);
      flushTimerRef.current = setTimeout(() => {
        emitScan();
      }, BARCODE_FLUSH_DELAY_MS);
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (disabled || isEditableTarget(event.target) || event.ctrlKey || event.altKey || event.metaKey) {
        clearBuffer();
        return;
      }

      if (event.key === "Enter") {
        if (bufferRef.current.length > 0) {
          event.preventDefault();
          emitScan();
        }
        return;
      }

      if (!BARCODE_VALID_CHARACTER.test(event.key)) return;

      const now = Date.now();
      const elapsed = now - lastKeyAtRef.current;
      if (lastKeyAtRef.current > 0 && elapsed > BARCODE_MAX_INTERVAL_MS) {
        clearBuffer();
      }

      bufferRef.current += event.key;
      lastKeyAtRef.current = now;
      scheduleFlush();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      clearBuffer();
    };
  }, [disabled]);
}
