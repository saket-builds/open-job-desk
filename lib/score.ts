import { discoveryPolicyFor, mentionsHomeMarket } from "./discovery-filters";
import type { ClassifiedListing } from "./classify";
import type { Gate, PipelineJob, ProfileSummary } from "./types";

export function scoreClassified(
  listing: ClassifiedListing,
  profile: ProfileSummary,
): Pick<
  PipelineJob,
  | "score"
  | "decision"
  | "autoEligible"
  | "mustHaveCoverage"
  | "gates"
  | "reasons"
  | "gaps"
> {
  const policy = discoveryPolicyFor(profile);
  const gates: Gate[] = [];
  const reasons: string[] = [];
  const gaps: string[] = [];
  const homeLabel =
    profile.targetLocations[0] ??
    profile.discovery.homeLocationPatterns[0]?.replace(/\\b/g, "") ??
    "home market";

  const excluded = (profile.excludedCompanies ?? []).some((name) =>
    listing.company.toLowerCase().includes(name.toLowerCase()),
  );
  if (listing.eligibility === "ineligible" || excluded) {
    const gap = excluded
      ? "Company is excluded by the candidate."
      : "Posting looks ineligible for your location / work-auth rules.";
    gates.push({ name: "eligibility", status: "fail", reason: gap });
    return {
      score: 0,
      decision: "exclude",
      autoEligible: false,
      mustHaveCoverage: 0,
      gates,
      reasons,
      gaps: [gap],
    };
  }
  gates.push({
    name: "eligibility",
    status: listing.eligibility === "eligible" ? "pass" : "ask",
    reason:
      listing.eligibility === "eligible"
        ? `Home market / location looks compatible (${homeLabel}).`
        : "Remote role — confirm it hires people in your target locations.",
  });
  gates.push({
    name: "posting-status",
    status: "pass",
    reason: "Pulled from a live ATS board API.",
  });

  if (
    listing.workMode !== "unspecified" &&
    !profile.workModes.includes(listing.workMode)
  ) {
    const gap = "Work mode is incompatible with targeting.";
    gates.push({ name: "work-mode", status: "fail", reason: gap });
    return {
      score: 0,
      decision: "exclude",
      autoEligible: false,
      mustHaveCoverage: 0,
      gates,
      reasons,
      gaps: [gap],
    };
  }
  gates.push({
    name: "work-mode",
    status: listing.workMode === "unspecified" ? "ask" : "pass",
    reason:
      listing.workMode === "unspecified"
        ? "Work mode not explicit."
        : `Work mode matches: ${listing.workMode}.`,
  });

  if (!profile.seniority.includes(listing.seniority)) {
    const gap = `Seniority is outside target: ${listing.seniority}.`;
    gates.push({ name: "seniority", status: "fail", reason: gap });
    return {
      score: 0,
      decision: listing.seniority === "unspecified" ? "ask" : "skip",
      autoEligible: false,
      mustHaveCoverage: 0,
      gates,
      reasons,
      gaps: [gap],
    };
  }
  gates.push({
    name: "seniority",
    status: "pass",
    reason: `Seniority matches: ${listing.seniority}.`,
  });

  const mustHaveCoverage = Math.round(
    (100 *
      listing.mustHaves.reduce(
        (sum, item) =>
          sum +
          (item.status === "met" ? 1 : item.status === "partial" ? 0.5 : 0),
        0,
      )) /
      listing.mustHaves.length,
  );
  if (mustHaveCoverage < profile.minMustHaveCoverage) {
    const gap = `Must-have coverage ${mustHaveCoverage}% is below ${profile.minMustHaveCoverage}%.`;
    gates.push({ name: "must-have-evidence", status: "fail", reason: gap });
    return {
      score: 0,
      decision: "skip",
      autoEligible: false,
      mustHaveCoverage,
      gates,
      reasons,
      gaps: [gap],
    };
  }
  gates.push({
    name: "must-have-evidence",
    status: "pass",
    reason: `Must-have evidence coverage is ${mustHaveCoverage}%.`,
  });

  let score = 0;
  if (profile.roleFamilies.includes(listing.roleFamily)) {
    score += 25;
    reasons.push(`Role family: ${listing.roleFamily}.`);
  } else {
    gaps.push("Role family does not directly match the target.");
  }
  score += 15;
  reasons.push(`Seniority: ${listing.seniority}.`);
  score += Math.round(mustHaveCoverage * 0.4);
  reasons.push(`Skills evidence: ${mustHaveCoverage}% of must-haves.`);

  const locationMatch =
    listing.remote ||
    listing.locations.some((place) =>
      mentionsHomeMarket(place, "", policy),
    ) ||
    profile.targetLocations.some((target) =>
      listing.locations.some((place) =>
        place.toLowerCase().includes(target.toLowerCase()),
      ),
    );
  if (locationMatch) {
    score += 10;
    reasons.push(
      listing.remote ? "Remote-compatible." : "Target location match.",
    );
  } else {
    gaps.push("Location is not an explicit target-location / remote match.");
  }

  const industry =
    profile.industries.find((item) =>
      `${listing.title} ${listing.description}`
        .toLowerCase()
        .includes(item.toLowerCase()),
    ) ?? profile.industries[0];
  if (industry) {
    score += 5;
    reasons.push(`Industry focus: ${industry}.`);
  }

  gaps.push("Published compensation is unavailable or not directly comparable.");

  let experienceMismatch = false;
  if (
    listing.experienceMin != null &&
    profile.yearsExperience + 2 < listing.experienceMin
  ) {
    experienceMismatch = true;
    score = Math.min(score, profile.autoSubmitMinScore - 1);
    gaps.push("Explicit experience range is materially misaligned.");
    gates.push({
      name: "experience",
      status: "warn",
      reason: "Experience mismatch requires manual review.",
    });
  }

  const finalScore = Math.min(score, 100);
  const decision =
    finalScore >= profile.manualReviewMinScore ? "review" : "skip";
  const autoEligible =
    decision === "review" &&
    profile.seniority.includes(listing.seniority) &&
    !experienceMismatch &&
    listing.eligibility === "eligible" &&
    finalScore >= profile.autoSubmitMinScore &&
    mustHaveCoverage >= profile.minMustHaveCoverage;

  return {
    score: finalScore,
    decision,
    autoEligible,
    mustHaveCoverage,
    gates,
    reasons,
    gaps,
  };
}

export function slugId(company: string, title: string, jobId: string): string {
  const slug = `${company}-${title}-${jobId}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
  return slug;
}
