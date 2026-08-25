import type { DiscoverySettings, ProfileSummary } from "./types";

/** Demo discovery defaults (Applied AI + India/open-remote). Keep aligned with default-profile. */
const BUILTIN_DISCOVERY: DiscoverySettings = {
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

export interface DiscoveryPolicy {
  openTitleMatching: boolean;
  titleHard: RegExp[];
  titleSoft: RegExp[];
  titleBlock: RegExp;
  jdSignals: RegExp;
  requireJdSignalsForSoftTitles: boolean;
  homeLocation: RegExp;
  openRemoteOk: boolean;
  excludeAbroadResidency: boolean;
  openRemote: RegExp;
  abroadResidency: RegExp;
  abroadCity: RegExp;
  onsite: RegExp;
}

function compileMany(patterns: string[]): RegExp[] {
  const out: RegExp[] = [];
  for (const pattern of patterns) {
    try {
      out.push(new RegExp(pattern, "i"));
    } catch {
      // skip invalid user regex
    }
  }
  return out;
}

function compileJoined(patterns: string[], fallback: RegExp): RegExp {
  if (patterns.length === 0) return fallback;
  try {
    return new RegExp(patterns.join("|"), "i");
  } catch {
    return fallback;
  }
}

const OPEN_REMOTE_RE =
  /\bremote\b|\bwork from home\b|\bwfh\b|\bworldwide\b|\bglobally\b|\banywhere\b|\bdistributed\b|\bwork from anywhere\b|\btelecommute\b/i;

const ABROAD_MARKERS =
  /\bunited states\b|\bus only\b|\busa only\b|\buk only\b|\bunited kingdom only\b|\beu only\b|\beurope only\b|\bmust (?:be )?located in (?:the )?(?:us|u\.s\.|united states|uk|united kingdom|eu|europe)\b|\bmust (?:be )?resid(?:e|ing) in (?:the )?(?:us|u\.s\.|united states|uk|united kingdom|eu|europe)\b|\bonly (?:us|u\.s\.|uk|eu) (?:citizens?|residents?)\b|\bno sponsorship\b|\brequires? (?:us|u\.s\.|uk) work authorization\b/i;

const ABROAD_CITY_RE =
  /\bsan francisco\b|\bnew york\b|\bseattle\b|\baustin\b|\bboston\b|\bchicago\b|\blos angeles\b|\blondon\b|\bberlin\b|\bparis\b|\bamsterdam\b|\bdublin\b|\btoronto\b|\bvancouver\b|\bsingapore\b(?![\s,/-]*india)/i;

const ONSITE_RE = /\bonsite\b|\bon-site\b|\bin-office\b|\bin office\b/i;
const NEVER_MATCH = /(?!)/;

export function policyFromSettings(settings: DiscoverySettings): DiscoveryPolicy {
  return {
    openTitleMatching: settings.openTitleMatching,
    titleHard: compileMany(settings.titleHardPatterns),
    titleSoft: compileMany(settings.titleSoftPatterns),
    titleBlock: compileJoined(settings.titleBlockPatterns, NEVER_MATCH),
    jdSignals: compileJoined(settings.jdSignalPatterns, NEVER_MATCH),
    requireJdSignalsForSoftTitles: settings.requireJdSignalsForSoftTitles,
    homeLocation: compileJoined(settings.homeLocationPatterns, NEVER_MATCH),
    openRemoteOk: settings.openRemoteOk,
    excludeAbroadResidency: settings.excludeAbroadResidency,
    openRemote: OPEN_REMOTE_RE,
    abroadResidency: ABROAD_MARKERS,
    abroadCity: ABROAD_CITY_RE,
    onsite: ONSITE_RE,
  };
}

export function policyFromProfile(profile: ProfileSummary): DiscoveryPolicy {
  return policyFromSettings(profile.discovery ?? BUILTIN_DISCOVERY);
}

export function defaultDiscoveryPolicy(): DiscoveryPolicy {
  return policyFromSettings(BUILTIN_DISCOVERY);
}

export function hay(title: string): string {
  return title.toLowerCase();
}

function policyOrDefault(policy?: DiscoveryPolicy): DiscoveryPolicy {
  return policy ?? defaultDiscoveryPolicy();
}

export function isBlockedTitle(
  title: string,
  policy?: DiscoveryPolicy,
): boolean {
  return policyOrDefault(policy).titleBlock.test(hay(title));
}

export function isHardTargetTitle(
  title: string,
  policy?: DiscoveryPolicy,
): boolean {
  const p = policyOrDefault(policy);
  const text = hay(title);
  if (isBlockedTitle(title, p)) return false;
  if (p.openTitleMatching) return true;
  return p.titleHard.some((pattern) => pattern.test(text));
}

export function isSoftTargetTitle(
  title: string,
  policy?: DiscoveryPolicy,
): boolean {
  const p = policyOrDefault(policy);
  const text = hay(title);
  if (isBlockedTitle(title, p)) return false;
  if (p.openTitleMatching) return false;
  return p.titleSoft.some((pattern) => pattern.test(text));
}

export function isListableTitle(
  title: string,
  policy?: DiscoveryPolicy,
): boolean {
  const p = policyOrDefault(policy);
  if (isBlockedTitle(title, p)) return false;
  if (p.openTitleMatching) return true;
  return isHardTargetTitle(title, p) || isSoftTargetTitle(title, p);
}

export function isTargetTitle(
  title: string,
  policy?: DiscoveryPolicy,
): boolean {
  return isHardTargetTitle(title, policy);
}

export function jdHasSignals(
  location: string,
  description: string,
  policy?: DiscoveryPolicy,
): boolean {
  const p = policyOrDefault(policy);
  return p.jdSignals.test(`${location}\n${description}`.toLowerCase());
}

export function jdHasAiSignals(
  location: string,
  description: string,
  policy?: DiscoveryPolicy,
): boolean {
  return jdHasSignals(location, description, policy);
}

export function mentionsHomeMarket(
  location: string,
  description = "",
  policy?: DiscoveryPolicy,
): boolean {
  const p = policyOrDefault(policy);
  return p.homeLocation.test(`${location}\n${description}`.toLowerCase());
}

export function mentionsIndia(
  location: string,
  description = "",
  policy?: DiscoveryPolicy,
): boolean {
  return mentionsHomeMarket(location, description, policy);
}

export function isOpenRemote(
  location: string,
  description = "",
  policy?: DiscoveryPolicy,
): boolean {
  const p = policyOrDefault(policy);
  if (!p.openRemoteOk) return false;
  const text = `${location}\n${description}`.toLowerCase();
  if (!location.trim() && !description.trim()) return true;
  return p.openRemote.test(text);
}

export function requiresResidencyAbroad(
  location: string,
  description = "",
  policy?: DiscoveryPolicy,
): boolean {
  const p = policyOrDefault(policy);
  if (!p.excludeAbroadResidency) return false;
  return p.abroadResidency.test(`${location}\n${description}`.toLowerCase());
}

export function isOnsiteOnlyAbroad(
  location: string,
  description = "",
  policy?: DiscoveryPolicy,
): boolean {
  const p = policyOrDefault(policy);
  const text = `${location}\n${description}`.toLowerCase();
  if (isOpenRemote(location, description, p)) return false;
  if (mentionsHomeMarket(location, description, p)) return false;
  const onsiteSignal = p.onsite.test(text) || /\bhybrid\b/i.test(text);
  if (!onsiteSignal) return false;
  return (
    p.abroadCity.test(text) ||
    /\bunited states\b|\busa\b|\bunited kingdom\b|\beurope\b/i.test(text)
  );
}

export function isLocationCompatible(
  location: string,
  description = "",
  policy?: DiscoveryPolicy,
): boolean {
  const p = policyOrDefault(policy);
  if (requiresResidencyAbroad(location, description, p)) return false;
  if (isOnsiteOnlyAbroad(location, description, p)) return false;
  if (mentionsHomeMarket(location, description, p)) return true;
  if (isOpenRemote(location, description, p)) return true;
  return false;
}

export function isIndiaCompatible(
  location: string,
  description = "",
  policy?: DiscoveryPolicy,
): boolean {
  return isLocationCompatible(location, description, policy);
}

export function isObviousOnsiteAbroadList(
  location: string,
  policy?: DiscoveryPolicy,
): boolean {
  const p = policyOrDefault(policy);
  const text = location.toLowerCase().trim();
  if (!text) return false;
  if (isOpenRemote(location, "", p)) return false;
  if (mentionsHomeMarket(location, "", p)) return false;
  if (p.onsite.test(text) || /\bhybrid\b/i.test(text)) {
    return (
      p.abroadCity.test(text) ||
      /\bunited states\b|\busa\b|\bunited kingdom\b|\beurope\b/i.test(text)
    );
  }
  if (/\bunited states only\b|\bus only\b|\buk only\b|\beu only\b/i.test(text)) {
    return p.excludeAbroadResidency;
  }
  return false;
}

export function passesListStage(
  title: string,
  location: string,
  policy?: DiscoveryPolicy,
): boolean {
  const p = policyOrDefault(policy);
  if (!isListableTitle(title, p)) return false;
  return !isObviousOnsiteAbroadList(location, p);
}

export function passesPostJdFilter(
  listing: {
    title: string;
    location: string;
    description: string;
  },
  policy?: DiscoveryPolicy,
): boolean {
  const p = policyOrDefault(policy);
  if (!isListableTitle(listing.title, p)) return false;
  if (!isLocationCompatible(listing.location, listing.description, p)) {
    return false;
  }
  if (
    p.requireJdSignalsForSoftTitles &&
    !p.openTitleMatching &&
    isSoftTargetTitle(listing.title, p) &&
    !isHardTargetTitle(listing.title, p) &&
    !jdHasSignals(listing.location, listing.description, p)
  ) {
    return false;
  }
  return true;
}

export function isPoorFitJob(
  job: {
    title: string;
    locations?: string[];
    description?: string;
    eligibility?: string;
  },
  policy?: DiscoveryPolicy,
): boolean {
  if (job.eligibility === "ineligible") return true;
  const location = (job.locations ?? []).join(" ");
  return !passesPostJdFilter(
    {
      title: job.title,
      location,
      description: job.description ?? "",
    },
    policy,
  );
}

export function discoveryPolicyFor(
  profile?: ProfileSummary | null,
): DiscoveryPolicy {
  return profile ? policyFromProfile(profile) : defaultDiscoveryPolicy();
}
