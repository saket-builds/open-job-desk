import { NextResponse } from "next/server";
import { addLedgerEntry } from "@/lib/ledger-service";
import { getPipelineJob, markJobSubmitted } from "@/lib/pipeline";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const job = await getPipelineJob(id);
  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }
  if (job.deskStatus !== "approved" && job.deskStatus !== "needs-you" && job.deskStatus !== "ready") {
    return NextResponse.json(
      { error: "Approve this role before marking it submitted" },
      { status: 400 },
    );
  }

  const submittedAt = new Date().toISOString();
  try {
    await addLedgerEntry({
      id: `${job.id}-${submittedAt.slice(0, 10)}`,
      company: job.company,
      role: job.title,
      url: job.url,
      source: job.source,
      score: job.score,
      status: "submitted",
      submittedAt,
      approval: "APPROVE SUBMIT",
      employerJobId: job.employerJobId,
      answers: job.preparedAnswers ?? {},
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (!/already recorded/i.test(message)) {
      return NextResponse.json(
        { error: message || "Could not record submission" },
        { status: 400 },
      );
    }
  }

  const updated = await markJobSubmitted(id);
  return NextResponse.json(updated);
}
