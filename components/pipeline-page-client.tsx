"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FindNewJobsButton } from "@/components/find-new-jobs-button";
import { ApplyDrawer } from "@/components/apply-drawer";
import { FilterChips } from "@/components/filter-chips";
import { MetricCards } from "@/components/metric-cards";
import { PipelineTable } from "@/components/pipeline-table";
import { Button } from "@/components/ui/button";
import type { DeskStatus, PipelineJob } from "@/lib/types";

interface PipelineResponse {
  jobs: PipelineJob[];
  metrics: {
    pendingApproval: number;
    approved: number;
    applied: number;
    skipped: number;
    avgScore: number;
    total: number;
  };
}

export function PipelinePageClient() {
  const [filter, setFilter] = useState<DeskStatus | "all">("all");
  const [data, setData] = useState<PipelineResponse | null>(null);
  const [selectedJob, setSelectedJob] = useState<PipelineJob | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [preparing, setPreparing] = useState(false);
  const returnFocusRef = useRef<HTMLDivElement>(null);

  const loadPipeline = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/pipeline?status=${filter}`);
    const json = (await res.json()) as PipelineResponse;
    setData(json);
    setLoading(false);
  }, [filter]);

  useEffect(() => {
    void loadPipeline();
  }, [loadPipeline]);

  async function runPrepare() {
    setPreparing(true);
    await fetch("/api/prepare", { method: "POST" });
    await loadPipeline();
    setPreparing(false);
  }

  const counts = useMemo(() => {
    if (!data) {
      return {
        all: 0,
        "pending-approval": 0,
        approved: 0,
        applied: 0,
        rejected: 0,
      };
    }
    return {
      all: data.metrics.total,
      "pending-approval": data.metrics.pendingApproval,
      approved: data.metrics.approved,
      applied: data.metrics.applied,
      rejected: data.metrics.skipped,
    };
  }, [data]);

  function handleSelect(job: PipelineJob) {
    setSelectedJob(job);
    setDrawerOpen(true);
  }

  function handleDrawerOpenChange(open: boolean) {
    setDrawerOpen(open);
    if (!open) {
      // Keep focus on All jobs — do not fall back to a sidebar link.
      requestAnimationFrame(() => {
        returnFocusRef.current?.focus();
      });
    }
  }

  return (
    <div className="flex flex-1 flex-col">
      <div
        ref={returnFocusRef}
        tabIndex={-1}
        className="outline-none"
        aria-label="All jobs"
      >
        <header className="border-b border-border px-6 py-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Pipeline</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Daily ATS scan finds Bangalore / remote AI roles. You approve
                before anything is submitted.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <FindNewJobsButton onScanned={loadPipeline} label="Scan jobs" />
              <Button
                variant="outline"
                onClick={runPrepare}
                disabled={preparing}
              >
                {preparing ? "Preparing…" : "Run auto-prepare"}
              </Button>
            </div>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-6 p-6">
          {data ? (
            <MetricCards
              pendingApproval={data.metrics.pendingApproval}
              approved={data.metrics.approved}
              applied={data.metrics.applied}
              avgScore={data.metrics.avgScore}
            />
          ) : null}

          <FilterChips value={filter} onChange={setFilter} counts={counts} />

          {loading ? (
            <div className="rounded-xl border border-border p-10 text-center text-sm text-muted-foreground">
              Loading pipeline…
            </div>
          ) : (
            <PipelineTable
              jobs={data?.jobs ?? []}
              onSelect={handleSelect}
              selectedId={selectedJob?.id}
            />
          )}
        </div>
      </div>

      <ApplyDrawer
        job={selectedJob}
        open={drawerOpen}
        onOpenChange={handleDrawerOpenChange}
        onSubmitted={loadPipeline}
        returnFocusRef={returnFocusRef}
      />
    </div>
  );
}
