import { SEED_JOBS } from "./seed-pipeline";
import type { AppState, StorageAdapter } from "./storage-types";

let memoryState: AppState | null = null;

function seedState(): AppState {
  return {
    pipeline: SEED_JOBS.map((job) => ({
      ...job,
      deskStatus: "pending-approval",
      preparedAt: job.scoredAt,
      blockers: job.pauseReason ? [job.pauseReason] : [],
    })),
    ledger: [],
  };
}

export class MemoryStorageAdapter implements StorageAdapter {
  async load(): Promise<AppState> {
    if (!memoryState) {
      memoryState = seedState();
    }
    return memoryState;
  }

  async save(state: AppState): Promise<void> {
    memoryState = state;
  }
}
