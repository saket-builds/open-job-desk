import { NextResponse } from "next/server";
import { getPipelineJob, updatePipelineJob } from "@/lib/pipeline";
import type { DeskStatus } from "@/lib/types";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const job = await getPipelineJob(id);
  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }
  return NextResponse.json(job);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = (await request.json()) as {
    deskStatus?: DeskStatus;
    pauseReason?: string;
    notes?: string;
  };

  const updated = await updatePipelineJob(id, body);
  if (!updated) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }
  return NextResponse.json(updated);
}
