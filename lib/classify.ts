import {
  isLocationCompatible,
  isOpenRemote,
  mentionsIndia,
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

export function classifyListing(
  listing: ScannedListing,
  profile: ProfileSummary,
): ClassifiedListing {
  const text = haystack(listing);
  const india = mentionsIndia(listing.location, listing.description);
  const remoteOpen = isOpenRemote(listing.location, listing.description);
  const compatible = isLocationCompatible(listing.location, listing.description);
  const hybrid = /\bhybrid\b/.test(text);
  const onsite = /\bonsite\b|\bon-site\b|\bin-office\b/.test(text);

  let eligibility: ClassifiedListing["eligibility"] = "ineligible";
  if (!compatible) {
    eligibility = "ineligible";
  } else if (india) {
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

  let roleFamily = "ai-ml";
  if (/backend|java|spring|api engineer/.test(text) && !/ai|llm|ml |genai/.test(text)) {
    roleFamily = "backend";
  } else if (/full[- ]stack/.test(text)) {
    roleFamily = "full-stack";
  }

  const locations = listing.location
    ? listing.location.split(/[·,|/]/).map((part) => part.trim()).filter(Boolean)
    : [];

  const skillNeedles = [
    "Python",
    "FastAPI",
    "RAG",
    "LangGraph",
    "LangChain",
    "OpenAI",
    "PostgreSQL",
    "Java",
    "embeddings",
    "vector",
  ];
  const mustHaves: MustHave[] = skillNeedles
    .filter((skill) => text.includes(skill.toLowerCase()))
    .map((skill) => {
      const known = profile.skills.some(
        (item) => item.toLowerCase() === skill.toLowerCase(),
      );
      return {
        requirement: skill,
        status: known ? "met" : "partial",
        evidence: known
          ? `${skill} is listed on the canonical resume.`
          : `${skill} appears in the JD; confirm resume evidence before claiming it.`,
      };
    });

  if (mustHaves.length === 0) {
    mustHaves.push({
      requirement: "Applied AI / software engineering background",
      status: "met",
      evidence: "4 years of software plus current Applied AI / RAG work.",
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
