import { buildApplicationAnswers } from "./answers";
import { runAgent, useBlobStorage } from "./agent";
import type { ProfileCheck, ProfileSummary, ResumeInfo } from "./types";

function profileFromEnv(): ProfileSummary | null {
  if (!process.env.PROFILE_JSON) return null;
  try {
    return JSON.parse(process.env.PROFILE_JSON) as ProfileSummary;
  } catch {
    return null;
  }
}

export async function getProfileCheck(): Promise<ProfileCheck> {
  const profile = profileFromEnv();
  if (profile) {
    return {
      configured: true,
      missing: [],
      fields: Object.keys(profile),
    };
  }

  if (useBlobStorage()) {
    throw new Error("PROFILE_JSON is not configured on Vercel");
  }

  return runAgent<{ configured: boolean; missing: string[]; fields: string[] }>(
    ["profile", "check"],
  );
}

export async function getProfileSummary(): Promise<ProfileSummary> {
  const profile = profileFromEnv();
  if (profile) return profile;

  if (useBlobStorage()) {
    throw new Error("PROFILE_JSON is not configured on Vercel");
  }

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

  return Object.fromEntries(entries) as unknown as ProfileSummary;
}

export async function getResumeInfo(): Promise<ResumeInfo> {
  if (process.env.RESUME_URL) {
    return {
      path: process.env.RESUME_URL,
      bytes: process.env.RESUME_BYTES
        ? Number(process.env.RESUME_BYTES)
        : undefined,
    };
  }

  if (useBlobStorage()) {
    return { path: "Upload resume to Vercel Blob and set RESUME_URL" };
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
    return { path: join(agentStateDir(), "resume.pdf") };
  }
}

export function getApplicationAnswers(profile: ProfileSummary) {
  return buildApplicationAnswers(profile);
}
