import type { LedgerEntry, LedgerReview } from "./types";
import { runAgent, useBlobStorage } from "./agent";
import { withState } from "./storage";

const EMPTY_REVIEW: LedgerReview = {
  submittedTotal: 0,
  uniqueSubmittedTotal: 0,
  outcomeCounts: { interview: 0, rejected: 0, offer: 0, withdrawn: 0 },
  nextStep: "Continue recording confirmed submissions and outcomes.",
};

export async function getLedgerEntries(): Promise<LedgerEntry[]> {
  if (useBlobStorage()) {
    const { getStorage } = await import("./storage");
    const state = await getStorage().load();
    return state.ledger;
  }

  const { readFile } = await import("node:fs/promises");
  const { join } = await import("node:path");
  const { agentStateDir } = await import("./agent");

  try {
    const raw = await readFile(
      join(agentStateDir(), "applications.ndjson"),
      "utf8",
    );
    return raw
      .split("\n")
      .filter(Boolean)
      .map((line) => JSON.parse(line) as LedgerEntry);
  } catch {
    return [];
  }
}

export async function getLedgerReview(): Promise<LedgerReview> {
  if (useBlobStorage()) {
    const entries = await getLedgerEntries();
    return {
      ...EMPTY_REVIEW,
      submittedTotal: entries.length,
      uniqueSubmittedTotal: entries.length,
      outcomeCounts: { interview: 0, rejected: 0, offer: 0, withdrawn: 0 },
    };
  }

  return runAgent<LedgerReview>(["ledger", "review"]);
}

export async function addLedgerEntry(
  entry: Record<string, unknown>,
  duplicateOverride?: string,
) {
  if (useBlobStorage()) {
    const ledgerEntry = entry as unknown as LedgerEntry;
    return withState(async (state) => {
      const duplicate = state.ledger.find(
        (item) =>
          item.id === ledgerEntry.id ||
          item.url === ledgerEntry.url ||
          (item.company === ledgerEntry.company && item.role === ledgerEntry.role),
      );
      if (duplicate && duplicateOverride !== "NEW REQUISITION CONFIRMED") {
        throw new Error("This application is already recorded.");
      }

      state.ledger = [...state.ledger, ledgerEntry];
      return { state, result: { recorded: ledgerEntry.id } };
    });
  }

  const payload = duplicateOverride
    ? { ...entry, duplicateOverride }
    : entry;
  return runAgent(["ledger", "add", "--stdin"], JSON.stringify(payload));
}
