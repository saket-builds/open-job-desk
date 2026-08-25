const TITLE_BLOCK =
  /\bruby\b|\brails\b|\bintern\b|\bmanager\b|\bdirector\b|\bhead of\b|\bsales\b|\baccount executive\b|\brecruiter\b/;

const HARD_TITLE_RE = [
  /\bai engineers?\b/,
  /\bgenai\b/,
  /\bgen ai\b/,
  /\bgenerative ai\b/,
  /\bapplied ai\b/,
  /\bllm\b/,
  /\brag\b/,
  /\blanggraph\b/,
  /\blangchain\b/,
  /\bmachine learning engineers?\b/,
  /\bml engineers?\b/,
  /\bmlops\b/,
  /\bnlp engineers?\b/,
  /\bai\/ml\b/,
  /\bagentic\b/,
  /\bvoice agents?\b/,
  /\bai developers?\b/,
  /\bai consultants?\b/,
  /\bai application\b/,
  /\bsoftware engineer\b.*\bai\b/,
  /\b(?:^|[^a-z])\bai\b(?:[^a-z]|$)/,
];

const SOFT_TITLE_RE = [
  /\bsoftware engineers?\b/,
  /\bbackend engineers?\b/,
  /\bfull[- ]?stack engineers?\b/,
  /\bplatform engineers?\b/,
  /\bpython engineers?\b/,
  /\bapi engineers?\b/,
  /\bdata engineers?\b/,
  /\bapplication engineers?\b/,
];

const OPEN_REMOTE_RE =
  /\bremote\b|\bwork from home\b|\bwfh\b|\bworldwide\b|\bglobally\b|\banywhere\b|\bdistributed\b|\bwork from anywhere\b|\btelecommute\b/;

const INDIA_RE = /\bbangalore\b|\bbengaluru\b|\bindia\b/;

const ABROAD_MARKERS =
  /\bunited states\b|\bus only\b|\busa only\b|\buk only\b|\bunited kingdom only\b|\beu only\b|\beurope only\b|\bmust (?:be )?located in (?:the )?(?:us|u\.s\.|united states|uk|united kingdom|eu|europe)\b|\bmust (?:be )?resid(?:e|ing) in (?:the )?(?:us|u\.s\.|united states|uk|united kingdom|eu|europe)\b|\bonly (?:us|u\.s\.|uk|eu) (?:citizens?|residents?)\b|\bno sponsorship\b|\brequires? (?:us|u\.s\.|uk) work authorization\b/;

const ABROAD_CITY_RE =
  /\bsan francisco\b|\bnew york\b|\bseattle\b|\baustin\b|\bboston\b|\bchicago\b|\blos angeles\b|\blondon\b|\bberlin\b|\bparis\b|\bamsterdam\b|\bdublin\b|\btoronto\b|\bvancouver\b|\bsingapore\b(?![\s,/-]*india)/;

const ONSITE_RE = /\bonsite\b|\bon-site\b|\bin-office\b|\bin office\b/;

const AI_JD_RE =
  /\bai\b|\bllm\b|\brag\b|\bgenai\b|\bgen ai\b|\bgenerative ai\b|\bmachine learning\b|\bmlops\b|\bnlp\b|\blangchain\b|\blanggraph\b|\bopenai\b|\bembeddings?\b|\bvector (?:db|database|search)\b|\bagentic\b|\bfine-?tun/;

function hay(title: string): string {
  return title.toLowerCase();
}

export function isBlockedTitle(title: string): boolean {
  return TITLE_BLOCK.test(hay(title));
}

export function isHardTargetTitle(title: string): boolean {
  const text = hay(title);
  if (isBlockedTitle(title)) return false;
  return HARD_TITLE_RE.some((pattern) => pattern.test(text));
}

export function isSoftTargetTitle(title: string): boolean {
  const text = hay(title);
  if (isBlockedTitle(title)) return false;
  return SOFT_TITLE_RE.some((pattern) => pattern.test(text));
}

/** Title passes list-stage fetch (hard AI titles or soft SWE titles). */
export function isListableTitle(title: string): boolean {
  return isHardTargetTitle(title) || isSoftTargetTitle(title);
}

/** Back-compat: explicit AI-family titles only. */
export function isTargetTitle(title: string): boolean {
  return isHardTargetTitle(title);
}

export function jdHasAiSignals(location: string, description: string): boolean {
  return AI_JD_RE.test(`${location}\n${description}`.toLowerCase());
}

export function mentionsIndia(location: string, description = ""): boolean {
  return INDIA_RE.test(`${location}\n${description}`.toLowerCase());
}

export function isOpenRemote(location: string, description = ""): boolean {
  const text = `${location}\n${description}`.toLowerCase();
  if (!location.trim() && !description.trim()) return true;
  return OPEN_REMOTE_RE.test(text);
}

export function requiresResidencyAbroad(location: string, description = ""): boolean {
  return ABROAD_MARKERS.test(`${location}\n${description}`.toLowerCase());
}

export function isOnsiteOnlyAbroad(location: string, description = ""): boolean {
  const text = `${location}\n${description}`.toLowerCase();
  if (isOpenRemote(location, description)) return false;
  if (mentionsIndia(location, description)) return false;
  const onsiteSignal = ONSITE_RE.test(text) || /\bhybrid\b/.test(text);
  if (!onsiteSignal) return false;
  return ABROAD_CITY_RE.test(text) || /\bunited states\b|\busa\b|\bunited kingdom\b|\beurope\b/.test(text);
}

/** Geo/auth filter after JD is available (or list location for Ashby/Lever). */
export function isLocationCompatible(location: string, description = ""): boolean {
  if (requiresResidencyAbroad(location, description)) return false;
  if (isOnsiteOnlyAbroad(location, description)) return false;
  if (mentionsIndia(location, description)) return true;
  if (isOpenRemote(location, description)) return true;
  return false;
}

/** Back-compat alias used by classify/score copy. */
export function isIndiaCompatible(location: string, description = ""): boolean {
  return isLocationCompatible(location, description);
}

/** Drop obvious onsite-abroad rows before JD enrichment. */
export function isObviousOnsiteAbroadList(location: string): boolean {
  const text = location.toLowerCase().trim();
  if (!text) return false;
  if (isOpenRemote(location)) return false;
  if (mentionsIndia(location)) return false;
  if (ONSITE_RE.test(text) || /\bhybrid\b/.test(text)) {
    return ABROAD_CITY_RE.test(text) || /\bunited states\b|\busa\b|\bunited kingdom\b|\beurope\b/.test(text);
  }
  if (/\bunited states only\b|\bus only\b|\buk only\b|\beu only\b/.test(text)) return true;
  return false;
}

export function passesListStage(title: string, location: string): boolean {
  if (!isListableTitle(title)) return false;
  return !isObviousOnsiteAbroadList(location);
}

export function passesPostJdFilter(listing: {
  title: string;
  location: string;
  description: string;
}): boolean {
  if (!isListableTitle(listing.title)) return false;
  if (!isLocationCompatible(listing.location, listing.description)) return false;
  if (
    isSoftTargetTitle(listing.title) &&
    !isHardTargetTitle(listing.title) &&
    !jdHasAiSignals(listing.location, listing.description)
  ) {
    return false;
  }
  return true;
}

export function isPoorFitJob(job: {
  title: string;
  locations?: string[];
  description?: string;
  eligibility?: string;
}): boolean {
  if (job.eligibility === "ineligible") return true;
  const location = (job.locations ?? []).join(" ");
  return !passesPostJdFilter({
    title: job.title,
    location,
    description: job.description ?? "",
  });
}
