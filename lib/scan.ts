import {
  passesListStage,
  passesPostJdFilter,
  type DiscoveryPolicy,
} from "./discovery-filters";
import { DEFAULT_PORTALS, type Portal } from "./portals";

export interface ScannedListing {
  title: string;
  company: string;
  url: string;
  source: Portal["source"];
  location: string;
  description: string;
  jobId: string;
}

const GREENHOUSE_ENRICH_CAP = 80;
const FETCH_CHUNK = 8;
const ENRICH_CHUNK = 10;

export function stripHtml(value: string): string {
  return value
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

async function fetchJson(
  url: string,
  timeoutMs = 8_000,
): Promise<unknown | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      redirect: "follow",
      headers: { accept: "application/json" },
    });
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export async function enrichGreenhouse(
  listing: ScannedListing,
  board: string,
): Promise<ScannedListing> {
  const json = (await fetchJson(
    `https://boards-api.greenhouse.io/v1/boards/${board}/jobs/${listing.jobId}?content=true`,
  )) as { content?: string } | null;
  if (!json?.content) return listing;
  return { ...listing, description: stripHtml(json.content).slice(0, 8_000) };
}

async function fetchGreenhouse(
  portal: Portal,
  policy?: DiscoveryPolicy,
): Promise<ScannedListing[]> {
  const json = (await fetchJson(
    `https://boards-api.greenhouse.io/v1/boards/${portal.board}/jobs`,
  )) as {
    jobs?: Array<{
      id: number;
      title?: string;
      absolute_url?: string;
      location?: { name?: string };
    }>;
  } | null;
  const jobs = json?.jobs ?? [];
  return jobs
    .filter((job) => job.absolute_url)
    .filter((job) =>
      passesListStage(job.title ?? "", job.location?.name ?? "", policy),
    )
    .map((job) => ({
      title: job.title ?? "",
      company: portal.name,
      url: job.absolute_url!,
      source: "greenhouse" as const,
      location: job.location?.name ?? "",
      description: "",
      jobId: String(job.id),
    }));
}

async function fetchAshby(
  portal: Portal,
  policy?: DiscoveryPolicy,
): Promise<ScannedListing[]> {
  const json = (await fetchJson(
    `https://api.ashbyhq.com/posting-api/job-board/${portal.board}`,
  )) as {
    jobs?: Array<{
      id?: string;
      title?: string;
      jobUrl?: string;
      location?: string;
      descriptionHtml?: string;
      descriptionPlain?: string;
    }>;
  } | null;
  return (json?.jobs ?? [])
    .filter((job) => job.jobUrl && job.title)
    .filter((job) =>
      passesListStage(job.title ?? "", job.location ?? "", policy),
    )
    .map((job) => ({
      title: job.title!,
      company: portal.name,
      url: job.jobUrl!,
      source: "ashby" as const,
      location: job.location ?? "",
      description: stripHtml(
        job.descriptionPlain ?? job.descriptionHtml ?? "",
      ).slice(0, 8_000),
      jobId: String(job.id ?? job.jobUrl),
    }));
}

async function fetchLever(
  portal: Portal,
  policy?: DiscoveryPolicy,
): Promise<ScannedListing[]> {
  const json = (await fetchJson(
    `https://api.lever.co/v0/postings/${portal.board}?mode=json`,
  )) as Array<{
    id?: string;
    text?: string;
    hostedUrl?: string;
    categories?: { location?: string };
    descriptionPlain?: string;
    description?: string;
  }> | null;
  if (!Array.isArray(json)) return [];
  return json
    .filter((job) => job.hostedUrl && job.text)
    .filter((job) =>
      passesListStage(job.text ?? "", job.categories?.location ?? "", policy),
    )
    .map((job) => ({
      title: job.text!,
      company: portal.name,
      url: job.hostedUrl!,
      source: "lever" as const,
      location: job.categories?.location ?? "",
      description: stripHtml(
        job.descriptionPlain ?? job.description ?? "",
      ).slice(0, 8_000),
      jobId: String(job.id ?? job.hostedUrl),
    }));
}

async function fetchPortal(
  portal: Portal,
  policy?: DiscoveryPolicy,
): Promise<ScannedListing[]> {
  if (portal.source === "greenhouse") return fetchGreenhouse(portal, policy);
  if (portal.source === "ashby") return fetchAshby(portal, policy);
  return fetchLever(portal, policy);
}

async function enrichInChunks(
  listings: ScannedListing[],
  portals: Portal[],
): Promise<ScannedListing[]> {
  const enriched: ScannedListing[] = [];
  for (let i = 0; i < listings.length; i += ENRICH_CHUNK) {
    const chunk = listings.slice(i, i + ENRICH_CHUNK);
    const results = await Promise.all(
      chunk.map((listing) => {
        const portal = portals.find(
          (item) =>
            item.name === listing.company && item.source === "greenhouse",
        );
        return portal ? enrichGreenhouse(listing, portal.board) : listing;
      }),
    );
    enriched.push(...results);
  }
  return enriched;
}

export async function scanPortals(options?: {
  portals?: Portal[];
  policy?: DiscoveryPolicy;
}): Promise<ScannedListing[]> {
  const portals = options?.portals?.length ? options.portals : DEFAULT_PORTALS;
  const policy = options?.policy;

  const chunks: Portal[][] = [];
  for (let i = 0; i < portals.length; i += FETCH_CHUNK) {
    chunks.push(portals.slice(i, i + FETCH_CHUNK));
  }

  const listings: ScannedListing[] = [];
  for (const chunk of chunks) {
    const results = await Promise.all(
      chunk.map((portal) => fetchPortal(portal, policy)),
    );
    listings.push(...results.flat());
  }

  const greenhouse = listings.filter((item) => item.source === "greenhouse");
  const others = listings.filter((item) => item.source !== "greenhouse");

  const toEnrich = greenhouse.slice(0, GREENHOUSE_ENRICH_CAP);
  const enriched = await enrichInChunks(toEnrich, portals);
  const unenrichedGreenhouse = greenhouse.slice(GREENHOUSE_ENRICH_CAP);

  const seen = new Set<string>();
  const unique: ScannedListing[] = [];
  for (const listing of [...enriched, ...unenrichedGreenhouse, ...others]) {
    const key = listing.url.split("?")[0];
    if (seen.has(key)) continue;
    seen.add(key);
    if (!passesPostJdFilter(listing, policy)) continue;
    unique.push(listing);
  }
  return unique;
}
