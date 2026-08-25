import { buildApplicationAnswers } from "./answers";
import { runAgent, useBlobStorage } from "./agent";
import { DEFAULT_PROFILE, sanitizeProfile } from "./default-profile";
import { loadAppState, withState } from "./storage";
import type { ProfileCheck, ProfileSummary, ResumeInfo } from "./types";

function profileFromEnv(): ProfileSummary | null {
  if (!process.env.PROFILE_JSON) return null;
  try {
    return sanitizeProfile(
      JSON.parse(process.env.PROFILE_JSON) as Partial<ProfileSummary>,
    );
  } catch {
    return null;
  }
}

async function profileFromAgent(): Promise<ProfileSummary | null> {
  if (useBlobStorage()) return null;
  try {
    const fields = [
      "name",
      "email",
      "phone",
      "location",
      "workAuthorization",
      "linkedin",
      "github",
      "portfolio",
      "availability",
      "currentCompensation",
      "targetCompensation",
      "roleFamilies",
      "seniority",
      "skills",
      "targetLocations",
      "workModes",
      "industries",
      "submissionMode",
      "yearsExperience",
      "autoSubmitMinScore",
      "manualReviewMinScore",
      "minMustHaveCoverage",
      "excludedCompanies",
    ] as const;

    const entries = await Promise.all(
      fields.map(async (field) => {
        const result = await runAgent<Record<string, unknown>>([
          "profile",
          "field",
          field,
        ]);
        return [field, result[field]] as const;
      }),
    );

    return sanitizeProfile(
      Object.fromEntries(entries) as unknown as Partial<ProfileSummary>,
    );
  } catch {
    return null;
  }
}

export async function getProfileCheck(): Promise<ProfileCheck> {
  const profile = await getProfileSummary();
  return {
    configured: true,
    missing: [],
    fields: Object.keys(profile),
  };
}

export async function getProfileSummary(): Promise<ProfileSummary> {
  const state = await loadAppState();
  if (state.profile) {
    return sanitizeProfile(state.profile);
  }

  const fromEnv = profileFromEnv();
  if (fromEnv) return fromEnv;

  const fromAgent = await profileFromAgent();
  if (fromAgent) return fromAgent;

  return sanitizeProfile(DEFAULT_PROFILE);
}

export async function saveProfileSummary(
  incoming: Partial<ProfileSummary>,
): Promise<ProfileSummary> {
  return withState(async (state) => {
    const current = state.profile
      ? sanitizeProfile(state.profile)
      : await getProfileSummaryBaseWithoutState();
    const profile = sanitizeProfile(incoming, current);
    state.profile = profile;
    return { state, result: profile };
  });
}

async function getProfileSummaryBaseWithoutState(): Promise<ProfileSummary> {
  const fromEnv = profileFromEnv();
  if (fromEnv) return fromEnv;
  const fromAgent = await profileFromAgent();
  if (fromAgent) return fromAgent;
  return sanitizeProfile(DEFAULT_PROFILE);
}

export async function getResumeInfo(): Promise<ResumeInfo> {
  const state = await loadAppState();
  if (state.resume?.path) {
    return state.resume;
  }

  if (process.env.RESUME_URL) {
    return {
      path: process.env.RESUME_URL,
      bytes: process.env.RESUME_BYTES
        ? Number(process.env.RESUME_BYTES)
        : undefined,
    };
  }

  if (useBlobStorage()) {
    return { path: "Upload a PDF on Your details (or set RESUME_URL)" };
  }

  const { readFile } = await import("node:fs/promises");
  const { join } = await import("node:path");
  const { agentStateDir } = await import("./agent");

  try {
    const raw = await readFile(join(agentStateDir(), "resume.json"), "utf8");
    const meta = JSON.parse(raw) as { sha256?: string; bytes?: number };
    return {
      path: join(agentStateDir(), "resume.pdf"),
      sha256: meta.sha256,
      bytes: meta.bytes,
    };
  } catch {
    return { path: "No résumé uploaded yet — add a PDF on Your details" };
  }
}

export async function saveResumeInfo(info: ResumeInfo): Promise<ResumeInfo> {
  return withState(async (state) => {
    state.resume = info;
    return { state, result: info };
  });
}

export function getApplicationAnswers(profile: ProfileSummary) {
  return buildApplicationAnswers(profile);
}
