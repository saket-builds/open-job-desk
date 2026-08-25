import { buildApplicationAnswers } from "./answers";
import { detectKnockouts } from "./knockouts";
import { getProfileSummary } from "./profile-service";
import type { PipelineJob } from "./types";

const PREPAREABLE: PipelineJob["deskStatus"][] = [
  "ready",
  "needs-you",
  "scored",
];

export async function prepareJob(job: PipelineJob): Promise<PipelineJob> {
  const profile = await getProfileSummary();
  const answers = buildApplicationAnswers(profile);
  const knockouts = detectKnockouts(job, profile);
  const blockers = [...knockouts];

  if (!job.autoEligible) {
    blockers.push("Role needs candidate's review before apply");
  }

  return {
    ...job,
    deskStatus: "pending-approval",
    preparedAt: new Date().toISOString(),
    preparedAnswers: answers,
    blockers: [...new Set(blockers)],
    knockouts,
  };
}

export function shouldAutoPrepare(
  job: PipelineJob,
  manualReviewMinScore = 70,
): boolean {
  return (
    PREPAREABLE.includes(job.deskStatus) &&
    job.score >= manualReviewMinScore &&
    job.decision !== "skip" &&
    job.decision !== "exclude"
  );
}

export async function autoPreparePipeline(
  jobs: PipelineJob[],
): Promise<PipelineJob[]> {
  const profile = await getProfileSummary();
  const next: PipelineJob[] = [];

  for (const job of jobs) {
    if (job.deskStatus === "pending-approval") {
      const knockouts = detectKnockouts(job, profile);
      next.push({
        ...job,
        knockouts,
        blockers: [...new Set([...(job.blockers ?? []), ...knockouts])],
      });
    } else if (shouldAutoPrepare(job, profile.manualReviewMinScore)) {
      next.push(await prepareJob(job));
    } else {
      next.push(job);
    }
  }

  return next;
}
