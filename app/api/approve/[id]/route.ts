import { NextResponse } from "next/server";
import { approveJob, rejectJob } from "@/lib/pipeline";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = (await request.json()) as {
    action: "approve" | "reject";
    reason?: string;
    approvedBy?: string;
  };

  const approver = body.approvedBy?.trim() || "Jordan Lee";

  if (body.action === "approve") {
    const job = await approveJob(id, approver);
    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }
    return NextResponse.json(job);
  }

  if (body.action === "reject") {
    const job = await rejectJob(id, approver, body.reason);
    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }
    return NextResponse.json(job);
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
