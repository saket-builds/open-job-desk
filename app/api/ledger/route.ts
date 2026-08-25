import { NextResponse } from "next/server";
import {
  addLedgerEntry,
  getLedgerEntries,
  getLedgerReview,
} from "@/lib/ledger-service";
import { updatePipelineJob } from "@/lib/pipeline";

export async function GET() {
  try {
    const [entries, review] = await Promise.all([
      getLedgerEntries(),
      getLedgerReview(),
    ]);
    return NextResponse.json({ entries, review });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load ledger";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { pipelineId, duplicateOverride, ...entry } = body as Record<
      string,
      unknown
    > & { pipelineId?: string };

    const result = await addLedgerEntry(entry, duplicateOverride as string | undefined);

    if (pipelineId) {
      await updatePipelineJob(pipelineId, {
        deskStatus: "applied",
        submittedAt: (entry.submittedAt as string) ?? new Date().toISOString(),
        outcomeStatus: "applied",
      });
    }

    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to record submission";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
