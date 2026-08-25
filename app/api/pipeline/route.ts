import { NextResponse } from "next/server";
import {
  filterByStatus,
  initializeLocalStateIfNeeded,
  listPipelineJobs,
  pipelineMetrics,
} from "@/lib/pipeline";
import type { DeskStatus } from "@/lib/types";

export async function GET(request: Request) {
  await initializeLocalStateIfNeeded();
  const { searchParams } = new URL(request.url);
  const status = (searchParams.get("status") ?? "all") as DeskStatus | "all";
  const jobs = await listPipelineJobs();
  const filtered = filterByStatus(jobs, status);

  return NextResponse.json({
    jobs: filtered,
    metrics: pipelineMetrics(jobs),
  });
}
