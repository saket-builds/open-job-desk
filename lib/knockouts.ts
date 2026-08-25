import type { PipelineJob, ProfileSummary } from "./types";

export function detectKnockouts(
  job: PipelineJob,
  profile?: ProfileSummary,
): string[] {
  const text = `${job.title}\n${job.description}\n${job.pauseReason ?? ""}`.toLowerCase();
  const knockouts: string[] = [];
  const years = profile?.yearsExperience;

  if (["greenhouse", "ashby", "lever"].includes(job.source)) {
    knockouts.push("Canonical resume PDF must be attached on the employer form");
  }
  if (
    /ctc|current compensation|expected compensation|salary expectation|desired salary/.test(
      text,
    )
  ) {
    knockouts.push(
      "Form likely asks CTC — paste the saved current/expected answers",
    );
  }
  if (job.eligibility === "unclear") {
    const places =
      profile?.targetLocations?.slice(0, 2).join(" / ") || "your target locations";
    knockouts.push(
      `Confirm this remote role hires people in ${places}`,
    );
  }
  if (/visa|sponsorship|work authorization|opt |h-1b/.test(text)) {
    knockouts.push(
      "Work-authorization / visa question — answer only from the stored profile",
    );
  }
  if (
    typeof job.experienceMin === "number" &&
    years != null &&
    job.experienceMin >= years + 3
  ) {
    knockouts.push(
      `${job.experienceMin}+ years listed — profile has ~${years}; review before applying`,
    );
  } else if (typeof job.experienceMin === "number" && years == null && job.experienceMin >= 7) {
    knockouts.push(
      `${job.experienceMin}+ years listed — review against your experience before applying`,
    );
  }
  if (
    profile?.seniority?.length &&
    !profile.seniority.includes(job.seniority) &&
    (job.seniority === "staff" || job.seniority === "principal")
  ) {
    knockouts.push("Level looks above your seniority targeting");
  }

  return [...new Set(knockouts)];
}
