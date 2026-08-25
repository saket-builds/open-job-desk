import type { PipelineJob } from "./types";

export function detectKnockouts(job: PipelineJob): string[] {
  const text = `${job.title}\n${job.description}\n${job.pauseReason ?? ""}`.toLowerCase();
  const knockouts: string[] = [];

  if (["greenhouse", "ashby", "lever"].includes(job.source)) {
    knockouts.push("Canonical resume PDF must be attached on the employer form");
  }
  if (/ctc|current compensation|expected compensation|salary expectation|desired salary/.test(text)) {
    knockouts.push("Form likely asks CTC — paste the saved current/expected answers");
  }
  if (job.eligibility === "unclear") {
    knockouts.push("Confirm this remote role hires India-based employees");
  }
  if (/visa|sponsorship|work authorization|opt |h-1b/.test(text)) {
    knockouts.push("Work-authorization / visa question — answer only from the stored profile");
  }
  if (typeof job.experienceMin === "number" && job.experienceMin >= 7) {
    knockouts.push(`${job.experienceMin}+ years listed — candidate has ~4; review before applying`);
  }
  if (job.seniority === "staff" || job.seniority === "principal") {
    knockouts.push("Level looks above mid/senior targeting");
  }

  return [...new Set(knockouts)];
}
