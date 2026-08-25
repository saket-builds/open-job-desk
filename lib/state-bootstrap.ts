import { SEED_JOBS } from "./seed-pipeline";
import type { AppState } from "./storage-types";
import type { DeskStatus, PipelineJob } from "./types";

async function seedPipeline(): Promise<PipelineJob[]> {
  const legacyPath = (await import("./agent")).agentStateDir();
  const { join } = await import("node:path");
  const { readFile, access } = await import("node:fs/promises");
  const legacyFile = join(legacyPath, "pipeline.ndjson");

  try {
    await access(legacyFile);
    const raw = await readFile(legacyFile, "utf8");
    return raw
      .split("\n")
      .filter(Boolean)
      .map((line) => JSON.parse(line) as PipelineJob);
  } catch {
    return SEED_JOBS.map((job) => ({
      ...job,
      deskStatus: "pending-approval" as DeskStatus,
      preparedAt: job.scoredAt,
      blockers: job.pauseReason ? [job.pauseReason] : [],
    }));
  }
}

export async function bootstrapAppState(state: AppState): Promise<AppState> {
  if (state.pipeline.length > 0) return state;
  return {
    ...state,
    pipeline: await seedPipeline(),
  };
}
