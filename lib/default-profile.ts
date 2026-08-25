import type { DiscoverySettings, ProfileSummary } from "./types";

/** Demo defaults — Applied AI + India/open-remote. Edit on Your details for any sector. */
export const DEFAULT_DISCOVERY: DiscoverySettings = {
  openTitleMatching: false,
  titleHardPatterns: [
    String.raw`\bai engineers?\b`,
    String.raw`\bgenai\b`,
    String.raw`\bgen ai\b`,
    String.raw`\bgenerative ai\b`,
    String.raw`\bapplied ai\b`,
    String.raw`\bllm\b`,
    String.raw`\brag\b`,
    String.raw`\blanggraph\b`,
    String.raw`\blangchain\b`,
    String.raw`\bmachine learning engineers?\b`,
    String.raw`\bml engineers?\b`,
    String.raw`\bmlops\b`,
    String.raw`\bnlp engineers?\b`,
    String.raw`\bai\/ml\b`,
    String.raw`\bagentic\b`,
    String.raw`\bvoice agents?\b`,
    String.raw`\bai developers?\b`,
    String.raw`\bai consultants?\b`,
    String.raw`\bai application\b`,
    String.raw`\bsoftware engineer\b.*\bai\b`,
    String.raw`(?:^|[^a-z])\bai\b(?:[^a-z]|$)`,
  ],
  titleSoftPatterns: [
    String.raw`\bsoftware engineers?\b`,
    String.raw`\bbackend engineers?\b`,
    String.raw`\bfull[- ]?stack engineers?\b`,
    String.raw`\bplatform engineers?\b`,
    String.raw`\bpython engineers?\b`,
    String.raw`\bapi engineers?\b`,
    String.raw`\bdata engineers?\b`,
    String.raw`\bapplication engineers?\b`,
  ],
  titleBlockPatterns: [
    String.raw`\bruby\b`,
    String.raw`\brails\b`,
    String.raw`\bintern\b`,
    String.raw`\bmanager\b`,
    String.raw`\bdirector\b`,
    String.raw`\bhead of\b`,
    String.raw`\bsales\b`,
    String.raw`\baccount executive\b`,
    String.raw`\brecruiter\b`,
  ],
  jdSignalPatterns: [
    String.raw`\bai\b`,
    String.raw`\bllm\b`,
    String.raw`\brag\b`,
    String.raw`\bgenai\b`,
    String.raw`\bgen ai\b`,
    String.raw`\bgenerative ai\b`,
    String.raw`\bmachine learning\b`,
    String.raw`\bmlops\b`,
    String.raw`\bnlp\b`,
    String.raw`\blangchain\b`,
    String.raw`\blanggraph\b`,
    String.raw`\bopenai\b`,
    String.raw`\bembeddings?\b`,
    String.raw`\bvector (?:db|database|search)\b`,
    String.raw`\bagentic\b`,
    String.raw`\bfine-?tun`,
  ],
  requireJdSignalsForSoftTitles: true,
  homeLocationPatterns: [
    String.raw`\bbangalore\b`,
    String.raw`\bbengaluru\b`,
    String.raw`\bindia\b`,
  ],
  openRemoteOk: true,
  excludeAbroadResidency: true,
  portals: [],
  replaceDefaultPortals: false,
};

export const DEFAULT_PROFILE: ProfileSummary = {
  name: "Jordan Lee",
  email: "jordan.lee@example.com",
  phone: "+1-555-0100",
  location: "Bangalore, India",
  workAuthorization:
    "Authorized to work in India. Available for Bangalore on-site/hybrid and remote roles that hire India-based employees.",
  linkedin: "https://www.linkedin.com/in/jordan-lee-demo/",
  github: "https://github.com/jordan-lee-demo",
  portfolio: "https://example.com/jordan-lee",
  availability: "Immediate",
  currentCompensation:
    "Current compensation is equity-based at an early-stage startup, so there isn't a traditional fixed annual CTC to quote.",
  targetCompensation:
    "Expected compensation is aligned with Bangalore market rates for Applied AI / GenAI engineer roles with production delivery experience.",
  roleFamilies: ["ai-ml", "backend", "full-stack", "product-engineering"],
  seniority: ["mid", "senior", "staff"],
  skills: [
    "Python",
    "FastAPI",
    "RAG",
    "LangGraph",
    "LangChain",
    "OpenAI",
    "PostgreSQL",
    "Java",
  ],
  targetLocations: ["Bangalore", "India", "Remote"],
  workModes: ["remote", "hybrid", "onsite", "unspecified"],
  industries: ["ai", "software"],
  submissionMode: "manual",
  yearsExperience: 4,
  autoSubmitMinScore: 80,
  manualReviewMinScore: 70,
  minMustHaveCoverage: 70,
  excludedCompanies: [],
  companyTypeAnswer: "Product-based company",
  discovery: { ...DEFAULT_DISCOVERY, portals: [] },
};

function asStringArray(value: unknown, fallback: string[]): string[] {
  if (!Array.isArray(value)) return [...fallback];
  return value.map((item) => String(item)).filter(Boolean);
}

function asNumber(value: unknown, fallback: number): number {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function sanitizeDiscovery(
  incoming: Partial<DiscoverySettings> | undefined,
  base: DiscoverySettings,
): DiscoverySettings {
  const src = incoming ?? {};
  return {
    openTitleMatching: Boolean(src.openTitleMatching ?? base.openTitleMatching),
    titleHardPatterns: asStringArray(src.titleHardPatterns, base.titleHardPatterns),
    titleSoftPatterns: asStringArray(src.titleSoftPatterns, base.titleSoftPatterns),
    titleBlockPatterns: asStringArray(src.titleBlockPatterns, base.titleBlockPatterns),
    jdSignalPatterns: asStringArray(src.jdSignalPatterns, base.jdSignalPatterns),
    requireJdSignalsForSoftTitles: Boolean(
      src.requireJdSignalsForSoftTitles ?? base.requireJdSignalsForSoftTitles,
    ),
    homeLocationPatterns: asStringArray(
      src.homeLocationPatterns,
      base.homeLocationPatterns,
    ),
    openRemoteOk: Boolean(src.openRemoteOk ?? base.openRemoteOk),
    excludeAbroadResidency: Boolean(
      src.excludeAbroadResidency ?? base.excludeAbroadResidency,
    ),
    portals: Array.isArray(src.portals)
      ? src.portals
          .map((portal) => ({
            name: String(portal?.name ?? "").trim(),
            source: portal?.source,
            board: String(portal?.board ?? "").trim(),
          }))
          .filter(
            (portal) =>
              portal.name &&
              portal.board &&
              (portal.source === "greenhouse" ||
                portal.source === "ashby" ||
                portal.source === "lever"),
          )
      : [...base.portals],
    replaceDefaultPortals: Boolean(
      src.replaceDefaultPortals ?? base.replaceDefaultPortals,
    ),
  };
}

/** Merge partial profile with defaults (safe for API + env JSON). */
export function sanitizeProfile(
  incoming: Partial<ProfileSummary> | null | undefined,
  base: ProfileSummary = DEFAULT_PROFILE,
): ProfileSummary {
  const src = incoming ?? {};
  return {
    name: String(src.name ?? base.name).trim() || base.name,
    email: String(src.email ?? base.email).trim() || base.email,
    phone: String(src.phone ?? base.phone).trim() || base.phone,
    location: String(src.location ?? base.location).trim() || base.location,
    workAuthorization:
      String(src.workAuthorization ?? base.workAuthorization).trim() ||
      base.workAuthorization,
    linkedin: src.linkedin != null ? String(src.linkedin) : base.linkedin,
    github: src.github != null ? String(src.github) : base.github,
    portfolio: src.portfolio != null ? String(src.portfolio) : base.portfolio,
    availability:
      src.availability != null ? String(src.availability) : base.availability,
    currentCompensation:
      src.currentCompensation != null
        ? String(src.currentCompensation)
        : base.currentCompensation,
    targetCompensation:
      src.targetCompensation != null
        ? String(src.targetCompensation)
        : base.targetCompensation,
    roleFamilies: asStringArray(src.roleFamilies, base.roleFamilies),
    seniority: asStringArray(src.seniority, base.seniority),
    skills: asStringArray(src.skills, base.skills),
    targetLocations: asStringArray(src.targetLocations, base.targetLocations),
    workModes: asStringArray(src.workModes, base.workModes),
    industries: asStringArray(src.industries, base.industries),
    submissionMode:
      String(src.submissionMode ?? base.submissionMode).trim() ||
      base.submissionMode,
    yearsExperience: asNumber(src.yearsExperience, base.yearsExperience),
    autoSubmitMinScore: asNumber(
      src.autoSubmitMinScore,
      base.autoSubmitMinScore,
    ),
    manualReviewMinScore: asNumber(
      src.manualReviewMinScore,
      base.manualReviewMinScore,
    ),
    minMustHaveCoverage: asNumber(
      src.minMustHaveCoverage,
      base.minMustHaveCoverage,
    ),
    excludedCompanies: asStringArray(
      src.excludedCompanies,
      base.excludedCompanies,
    ),
    companyTypeAnswer:
      src.companyTypeAnswer != null
        ? String(src.companyTypeAnswer)
        : base.companyTypeAnswer,
    discovery: sanitizeDiscovery(src.discovery, base.discovery),
  };
}
