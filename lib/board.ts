import type { OutcomeStatus, PipelineJob } from "./types";

export const FOLLOW_UP_DAYS = 10;

export function daysSince(iso?: string): number | null {
  if (!iso) return null;
  const then = Date.parse(iso);
  if (Number.isNaN(then)) return null;
  return Math.floor((Date.now() - then) / 86_400_000);
}

export function followUpDue(job: PipelineJob): boolean {
  if (job.deskStatus !== "applied") return false;
  const outcome = job.outcomeStatus ?? "applied";
  if (outcome !== "applied") return false;
  const days = daysSince(job.submittedAt);
  return days != null && days >= FOLLOW_UP_DAYS;
}

export function outcomeLabel(status: OutcomeStatus | undefined): string {
  if (status === "interview") return "Interview";
  if (status === "offer") return "Offer";
  if (status === "closed") return "Closed";
  return "Applied";
}

export function appliedDateLabel(iso?: string): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function boardLanes(jobs: PipelineJob[]) {
  const toReview = jobs
    .filter((job) => job.deskStatus === "pending-approval")
    .sort((a, b) => (b.scoredAt ?? "").localeCompare(a.scoredAt ?? ""));
  const applyingNow = jobs
    .filter(
      (job) =>
        job.deskStatus === "approved" ||
        job.deskStatus === "needs-you" ||
        job.deskStatus === "ready",
    )
    .sort((a, b) => (b.approvedAt ?? "").localeCompare(a.approvedAt ?? ""));
  const history = jobs
    .filter((job) => job.deskStatus === "applied")
    .sort((a, b) => (b.submittedAt ?? "").localeCompare(a.submittedAt ?? ""));
  return { toReview, applyingNow, history };
}
