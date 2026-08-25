import { classifyListing } from "./classify";
import { discoveryPolicyFor } from "./discovery-filters";
import { fetchJobFromUrl } from "./import-job";
import { isPoorFitJob, passesPostJdFilter, resolvePortals } from "./portals";
import { autoPreparePipeline, prepareJob } from "./prepare";
import { getProfileSummary } from "./profile-service";
import { scanPortals } from "./scan";
import { scoreClassified, slugId } from "./score";
import { loadAppState, withState } from "./storage";
import { localStateExists } from "./storage-local";
import type {
  DeskStatus,
  OutcomeStatus,
  PipelineJob,
  ProfileSummary,
} from "./types";
import type { ScannedListing } from "./scan";

function normalizeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    parsed.hash = "";
    parsed.searchParams.delete("utm_source");
    parsed.searchParams.delete("utm_medium");
    parsed.searchParams.delete("utm_campaign");
    parsed.searchParams.delete("gh_src");
    return parsed.toString().replace(/\/$/, "");
  } catch {
    return url.split("?")[0];
  }
}

function unclearPauseReason(profile: ProfileSummary): string {
  const places =
    profile.targetLocations.slice(0, 2).join(" / ") || "your target locations";
  return `Confirm this remote role hires people in ${places}`;
}

async function migrateLegacyPipeline(state: {
  pipeline: PipelineJob[];
  ledger: unknown[];
}): Promise<PipelineJob[]> {
  if (state.pipeline.length > 0) return state.pipeline;
  const { bootstrapAppState } = await import("./state-bootstrap");
  const bootstrapped = await bootstrapAppState(
    state as import("./storage-types").AppState,
  );
  return bootstrapped.pipeline;
}

export async function ensurePipelineLoaded(): Promise<PipelineJob[]> {
  const state = await loadAppState();
  return state.pipeline;
}

export async function listPipelineJobs(): Promise<PipelineJob[]> {
  return ensurePipelineLoaded();
}

export async function getPipelineJob(id: string): Promise<PipelineJob | null> {
  const jobs = await listPipelineJobs();
  return jobs.find((job) => job.id === id) ?? null;
}

export async function updatePipelineJob(
  id: string,
  patch: Partial<PipelineJob>,
): Promise<PipelineJob | null> {
  return withState(async (state) => {
    const index = state.pipeline.findIndex((job) => job.id === id);
    if (index === -1) {
      return { state, result: null };
    }

    state.pipeline[index] = { ...state.pipeline[index], ...patch };
    return { state, result: state.pipeline[index] };
  });
}

async function listingToPipelineJob(
  listing: ScannedListing,
  profile: ProfileSummary,
  options?: { force?: boolean },
): Promise<PipelineJob | null> {
  const classified = classifyListing(listing, profile);
  const scored = scoreClassified(classified, profile);
  if (
    !options?.force &&
    (scored.decision === "exclude" || scored.decision === "skip")
  ) {
    return null;
  }

  const forced =
    Boolean(options?.force) &&
    (scored.decision === "exclude" || scored.decision === "skip");

  const job: PipelineJob = {
    id: slugId(listing.company, listing.title, listing.jobId),
    title: listing.title,
    company: listing.company,
    url: listing.url,
    source: listing.source,
    description: listing.description.slice(0, 1500),
    postingStatus: "active",
    eligibility: classified.eligibility,
    roleFamily: classified.roleFamily,
    seniority: classified.seniority,
    workMode: classified.workMode,
    remote: classified.remote,
    locations: classified.locations,
    experienceMin: classified.experienceMin,
    mustHaves: classified.mustHaves,
    ...scored,
    decision: forced ? "review" : scored.decision,
    score: forced
      ? Math.max(scored.score, profile.manualReviewMinScore)
      : scored.score,
    autoEligible: forced ? false : scored.autoEligible,
    deskStatus: "scored",
    employerJobId: `${listing.source}:${listing.jobId}`,
    scoredAt: new Date().toISOString(),
    pauseReason:
      classified.eligibility === "unclear"
        ? unclearPauseReason(profile)
        : "Attach resume PDF on the employer form after approval",
    notes: forced
      ? "Force-added — skipped discovery filters; review carefully."
      : undefined,
  };

  return prepareJob(job);
}

export async function importJobFromUrl(
  url: string,
  options?: { force?: boolean },
): Promise<{
  added: boolean;
  job: PipelineJob | null;
  reason?: string;
}> {
  const listing = await fetchJobFromUrl(url);
  if (!listing) {
    return {
      added: false,
      job: null,
      reason:
        "Could not read that URL. Paste a Greenhouse, Ashby, or Lever job link.",
    };
  }

  const profile = await getProfileSummary();
  const policy = discoveryPolicyFor(profile);

  if (!options?.force && !passesPostJdFilter(listing, policy)) {
    return {
      added: false,
      job: null,
      reason:
        "Role filtered out by your discovery rules (title, location, or JD signals). Check “Force add” to keep it anyway.",
    };
  }

  return withState<{
    added: boolean;
    job: PipelineJob | null;
    reason?: string;
  }>(async (state) => {
    if (state.pipeline.length === 0) {
      state.pipeline = await migrateLegacyPipeline(state);
    }

    const normalized = normalizeUrl(listing.url);
    const duplicate = state.pipeline.find(
      (job) => normalizeUrl(job.url) === normalized,
    );
    if (duplicate) {
      return {
        state,
        result: {
          added: false,
          job: duplicate,
          reason: "That role is already on your desk.",
        },
      };
    }

    const prepared = await listingToPipelineJob(listing, profile, options);
    if (!prepared) {
      return {
        state,
        result: {
          added: false,
          job: null,
          reason:
            "Role scored too low or was excluded by profile rules. Check “Force add” to keep it.",
        },
      };
    }

    state.pipeline.push(prepared);
    return { state, result: { added: true, job: prepared } };
  });
}

export async function runDiscovery(): Promise<{
  scanned: number;
  added: number;
  skipped: number;
  jobs: PipelineJob[];
}> {
  const profile = await getProfileSummary();
  const policy = discoveryPolicyFor(profile);
  const portals = resolvePortals(profile);
  const listings = await scanPortals({ portals, policy });

  return withState(async (state) => {
    if (state.pipeline.length === 0) {
      state.pipeline = await migrateLegacyPipeline(state);
    }

    state.pipeline = state.pipeline.map((job) => {
      if (
        (job.deskStatus === "pending-approval" ||
          job.deskStatus === "scored") &&
        isPoorFitJob(job, policy)
      ) {
        return {
          ...job,
          deskStatus: "skipped",
          notes:
            "Removed: outside your discovery rules (title, location, or JD signals)",
        };
      }
      return job;
    });

    const existing = new Set(
      state.pipeline.map((job) => normalizeUrl(job.url)),
    );
    let skipped = 0;
    const added: PipelineJob[] = [];

    for (const listing of listings) {
      if (existing.has(normalizeUrl(listing.url))) {
        skipped += 1;
        continue;
      }

      const prepared = await listingToPipelineJob(listing, profile);
      if (!prepared) {
        skipped += 1;
        continue;
      }

      state.pipeline.push(prepared);
      existing.add(normalizeUrl(prepared.url));
      added.push(prepared);
    }

    return {
      state,
      result: {
        scanned: listings.length,
        added: added.length,
        skipped,
        jobs: added,
      },
    };
  });
}

export async function runAutoPrepare(): Promise<{
  prepared: number;
  jobs: PipelineJob[];
}> {
  return withState(async (state) => {
    if (state.pipeline.length === 0) {
      state.pipeline = await migrateLegacyPipeline(state);
    }

    const before = state.pipeline.filter(
      (job) => job.deskStatus === "pending-approval",
    ).length;
    state.pipeline = await autoPreparePipeline(state.pipeline);
    const after = state.pipeline.filter(
      (job) => job.deskStatus === "pending-approval",
    ).length;

    return {
      state,
      result: { prepared: after - before, jobs: state.pipeline },
    };
  });
}

export function filterByStatus(
  jobs: PipelineJob[],
  status: DeskStatus | "all",
): PipelineJob[] {
  if (status === "all") return jobs;
  return jobs.filter((job) => job.deskStatus === status);
}

export function pipelineMetrics(jobs: PipelineJob[]) {
  const pendingApproval = jobs.filter(
    (j) => j.deskStatus === "pending-approval",
  ).length;
  const approved = jobs.filter((j) => j.deskStatus === "approved").length;
  const applied = jobs.filter((j) => j.deskStatus === "applied").length;
  const skipped = jobs.filter(
    (j) => j.deskStatus === "skipped" || j.deskStatus === "rejected",
  ).length;
  const avgScore =
    jobs.length > 0
      ? Math.round(jobs.reduce((sum, j) => sum + j.score, 0) / jobs.length)
      : 0;

  return {
    pendingApproval,
    approved,
    applied,
    skipped,
    avgScore,
    total: jobs.length,
    ready: approved,
    paused: pendingApproval,
  };
}

export async function markJobSubmitted(
  id: string,
): Promise<PipelineJob | null> {
  const submittedAt = new Date().toISOString();
  return updatePipelineJob(id, {
    deskStatus: "applied",
    submittedAt,
    outcomeStatus: "applied",
  });
}

export async function setJobOutcome(
  id: string,
  outcomeStatus: OutcomeStatus,
): Promise<PipelineJob | null> {
  return updatePipelineJob(id, { outcomeStatus });
}

export async function approveJob(
  id: string,
  approvedBy: string,
): Promise<PipelineJob | null> {
  return updatePipelineJob(id, {
    deskStatus: "approved",
    approvedAt: new Date().toISOString(),
    approvedBy,
  });
}

export async function rejectJob(
  id: string,
  approvedBy: string,
  reason?: string,
): Promise<PipelineJob | null> {
  return updatePipelineJob(id, {
    deskStatus: "rejected",
    approvedAt: new Date().toISOString(),
    approvedBy,
    notes: reason,
  });
}

export async function initializeLocalStateIfNeeded(): Promise<void> {
  if (process.env.BLOB_READ_WRITE_TOKEN) return;
  const exists = await localStateExists();
  if (!exists) {
    await runAutoPrepare();
  }
}
