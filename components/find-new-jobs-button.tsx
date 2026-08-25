"use client";

import { Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useJobScan } from "@/lib/use-job-scan";

interface FindNewJobsButtonProps {
  onScanned?: () => void | Promise<void>;
  label?: string;
  variant?: "default" | "outline";
}

export function FindNewJobsButton({
  onScanned,
  label = "Find new jobs",
  variant = "default",
}: FindNewJobsButtonProps) {
  const { scanning, scanMessage, runScan } = useJobScan(onScanned);

  return (
    <div className="flex flex-col items-stretch gap-2 sm:items-end">
      <Button variant={variant} onClick={() => void runScan()} disabled={scanning}>
        {scanning ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Search className="size-4" />
        )}
        {scanning ? "Searching…" : label}
      </Button>
      {scanMessage ? (
        <p className="max-w-sm text-sm text-muted-foreground" role="status">
          {scanMessage}
        </p>
      ) : null}
    </div>
  );
}
