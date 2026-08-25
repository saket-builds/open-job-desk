import {
  discoveryPolicyFor,
  isLocationCompatible,
  isOpenRemote,
  mentionsHomeMarket,
} from "./discovery-filters";
import type { ScannedListing } from "./scan";
import type { MustHave, ProfileSummary } from "./types";

export interface ClassifiedListing extends ScannedListing {
  eligibility: "eligible" | "unclear" | "ineligible";
  roleFamily: string;
  seniority: string;
  workMode: "remote" | "hybrid" | "onsite" | "unspecified";
  remote: boolean;
  locations: string[];
  mustHaves: MustHave[];
  experienceMin?: number;
}

function haystack(listing: ScannedListing): string {
  return `${listing.title}\n${listing.location}\n${listing.description}`.toLowerCase();
}

function inferRoleFamily(text: string, profile: ProfileSummary): string {
  const families = profile.roleFamilies;
  if (/full[- ]stack/.test(text) && families.includes("full-stack")) {
    return "full-stack";
  }
  if (
    /backend|java|spring|api engineer/.test(text) &&
    families.includes("backend")
  ) {
    return "backend";
  }
  if (
    (/ai|llm|ml |genai|machine learning|rag\b/.test(text) ||
      families.includes("ai-ml")) &&
    families.includes("ai-ml")
  ) {
    if (/ai|llm|ml |genai|machine learning|rag\b/.test(text)) return "ai-ml";
  }
  if (families.includes("product-engineering") && /product engineer/.test(text)) {
    return "product-engineering";
  }
  return families[0] ?? "general";
}

export function classifyListing(
  listing: ScannedListing,
  profile: ProfileSummary,
): ClassifiedListing {
  const policy = discoveryPolicyFor(profile);
  const text = haystack(listing);
  const home = mentionsHomeMarket(listing.location, listing.description, policy);
  const remoteOpen = isOpenRemote(listing.location, listing.description, policy);
  const compatible = isLocationCompatible(
    listing.location,
    listing.description,
    policy,
  );
  const hybrid = /\bhybrid\b/.test(text);
  const onsite = /\bonsite\b|\bon-site\b|\bin-office\b/.test(text);

  let eligibility: ClassifiedListing["eligibility"] = "ineligible";
  if (!compatible) {
    eligibility = "ineligible";
  } else if (home) {
    eligibility = "eligible";
  } else if (remoteOpen) {
    eligibility = "unclear";
  }

  let workMode: ClassifiedListing["workMode"] = "unspecified";
  if (remoteOpen) workMode = "remote";
  else if (hybrid) workMode = "hybrid";
  else if (onsite) workMode = "onsite";

  let seniority = "mid";
  if (/\bstaff\b|principal|director|head of/.test(text)) seniority = "staff";
  else if (/\bsenior\b|\bsr\.?\b|lead\b/.test(text)) seniority = "senior";
  else if (/\bjunior\b|\bintern\b|graduate/.test(text)) seniority = "junior";

  const roleFamily = inferRoleFamily(text, profile);

  const locations = listing.location
    ? listing.location
        .split(/[·,|/]/)
        .map((part) => part.trim())
        .filter(Boolean)
    : [];

  const skillNeedles =
    profile.skills.length > 0
      ? profile.skills
      : ["communication", "collaboration"];

  const mustHaves: MustHave[] = skillNeedles
    .filter((skill) => text.includes(skill.toLowerCase()))
    .map((skill) => {
      const known = profile.skills.some(
        (item) => item.toLowerCase() === skill.toLowerCase(),
      );
      return {
        requirement: skill,
        status: known ? ("met" as const) : ("partial" as const),
        evidence: known
          ? `${skill} is listed on your profile skills.`
          : `${skill} appears in the JD; confirm resume evidence before claiming it.`,
      };
    });

  if (mustHaves.length === 0) {
    const label =
      profile.roleFamilies[0] ??
      profile.industries[0] ??
      "relevant experience";
    mustHaves.push({
      requirement: `${label} background`,
      status: "met",
      evidence: `${profile.yearsExperience} years of experience on profile (${label}).`,
    });
  }

  const years = text.match(/(\d+)\+?\s*years/);
  const experienceMin = years ? Number(years[1]) : undefined;

  return {
    ...listing,
    eligibility,
    roleFamily,
    seniority,
    workMode,
    remote: remoteOpen,
    locations,
    mustHaves,
    experienceMin,
  };
}
