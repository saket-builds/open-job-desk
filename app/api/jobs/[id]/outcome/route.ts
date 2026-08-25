import { NextResponse } from "next/server";
import { getPipelineJob, setJobOutcome } from "@/lib/pipeline";
import type { OutcomeStatus } from "@/lib/types";

const ALLOWED: OutcomeStatus[] = ["applied", "interview", "offer", "closed"];

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const job = await getPipelineJob(id);
  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }
  if (job.deskStatus !== "applied") {
    return NextResponse.json(
      { error: "Mark this as submitted before setting an outcome" },
      { status: 400 },
    );
  }

  const body = (await request.json()) as { status?: string };
  const status = body.status as OutcomeStatus | undefined;
  if (!status || !ALLOWED.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const updated = await setJobOutcome(id, status);
  return NextResponse.json(updated);
}
