"use client";

import { useCallback, useState } from "react";

interface ScanResult {
  scanned?: number;
  added?: number;
  skipped?: number;
  error?: string;
}

export function useJobScan(onComplete?: () => void | Promise<void>) {
  const [scanning, setScanning] = useState(false);
  const [scanMessage, setScanMessage] = useState<string | null>(null);

  const runScan = useCallback(async () => {
    setScanning(true);
    setScanMessage(null);
    try {
      const res = await fetch("/api/scan", { method: "POST" });
      const json = (await res.json()) as ScanResult;
      if (!res.ok) throw new Error(json.error ?? "Search failed");

      const added = json.added ?? 0;
      if (added > 0) {
        setScanMessage(
          `Found ${added} new role${added === 1 ? "" : "s"} — check To review below.`,
        );
      } else {
        setScanMessage(
          `No new roles right now (${json.scanned ?? 0} listings checked). The daily search also runs around 11:30 AM.`,
        );
      }
      await onComplete?.();
    } catch (error) {
      setScanMessage(
        error instanceof Error ? error.message : "Search failed — try again.",
      );
    } finally {
      setScanning(false);
    }
  }, [onComplete]);

  return { scanning, scanMessage, runScan, setScanMessage };
}
