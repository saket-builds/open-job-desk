import { PORTALS } from "./portals";
import { enrichGreenhouse, stripHtml, type ScannedListing } from "./scan";

export interface ParsedJobUrl {
  source: "greenhouse" | "ashby" | "lever";
  board: string;
  jobId: string;
  company?: string;
}

export function parseJobUrl(raw: string): ParsedJobUrl | null {
  let url: URL;
  try {
    url = new URL(raw.trim());
  } catch {
    return null;
  }

  const host = url.hostname.toLowerCase();
  const parts = url.pathname.split("/").filter(Boolean);

  if (
    host.includes("greenhouse.io") &&
    parts.length >= 3 &&
    parts[1] === "jobs"
  ) {
    const board = parts[0];
    const jobId = parts[2];
    const portal = PORTALS.find(
      (item) => item.source === "greenhouse" && item.board === board,
    );
    return {
      source: "greenhouse",
      board,
      jobId,
      company: portal?.name ?? board,
    };
  }

  if (host.includes("ashbyhq.com") && parts.length >= 2) {
    const board = parts[0];
    const jobId = parts[1];
    const portal = PORTALS.find(
      (item) => item.source === "ashby" && item.board === board,
    );
    return {
      source: "ashby",
      board,
      jobId,
      company: portal?.name ?? board,
    };
  }

  if (host.includes("lever.co") && parts.length >= 2) {
    const board = parts[0];
    const jobId = parts[1];
    const portal = PORTALS.find(
      (item) => item.source === "lever" && item.board === board,
    );
    return {
      source: "lever",
      board,
      jobId,
      company: portal?.name ?? board,
    };
  }

  return null;
}

async function fetchJson(url: string): Promise<unknown | null> {
  try {
    const response = await fetch(url, {
      headers: { accept: "application/json" },
    });
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

async function fetchGreenhouseJob(parsed: ParsedJobUrl): Promise<ScannedListing | null> {
  const json = (await fetchJson(
    `https://boards-api.greenhouse.io/v1/boards/${parsed.board}/jobs/${parsed.jobId}?content=true`,
  )) as {
    id?: number;
    title?: string;
    absolute_url?: string;
    location?: { name?: string };
    content?: string;
  } | null;
  if (!json?.absolute_url || !json.title) return null;

  let listing: ScannedListing = {
    title: json.title,
    company: parsed.company ?? parsed.board,
    url: json.absolute_url,
    source: "greenhouse",
    location: json.location?.name ?? "",
    description: stripHtml(json.content ?? "").slice(0, 8_000),
    jobId: String(json.id ?? parsed.jobId),
  };

  if (!listing.description) {
    listing = await enrichGreenhouse(listing, parsed.board);
  }
  return listing;
}

async function fetchAshbyJob(parsed: ParsedJobUrl): Promise<ScannedListing | null> {
  const json = (await fetchJson(
    `https://api.ashbyhq.com/posting-api/job-board/${parsed.board}`,
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

  const job = (json?.jobs ?? []).find(
    (item) =>
      item.id === parsed.jobId ||
      item.jobUrl?.includes(parsed.jobId) ||
      item.jobUrl?.endsWith(`/${parsed.jobId}`),
  );
  if (!job?.jobUrl || !job.title) return null;

  return {
    title: job.title,
    company: parsed.company ?? parsed.board,
    url: job.jobUrl,
    source: "ashby",
    location: job.location ?? "",
    description: stripHtml(
      job.descriptionPlain ?? job.descriptionHtml ?? "",
    ).slice(0, 8_000),
    jobId: String(job.id ?? parsed.jobId),
  };
}

async function fetchLeverJob(parsed: ParsedJobUrl): Promise<ScannedListing | null> {
  const json = (await fetchJson(
    `https://api.lever.co/v0/postings/${parsed.board}?mode=json`,
  )) as Array<{
    id?: string;
    text?: string;
    hostedUrl?: string;
    categories?: { location?: string };
    descriptionPlain?: string;
    description?: string;
  }> | null;
  if (!Array.isArray(json)) return null;

  const job = json.find(
    (item) =>
      item.id === parsed.jobId ||
      item.hostedUrl?.includes(parsed.jobId),
  );
  if (!job?.hostedUrl || !job.text) return null;

  return {
    title: job.text,
    company: parsed.company ?? parsed.board,
    url: job.hostedUrl,
    source: "lever",
    location: job.categories?.location ?? "",
    description: stripHtml(
      job.descriptionPlain ?? job.description ?? "",
    ).slice(0, 8_000),
    jobId: String(job.id ?? parsed.jobId),
  };
}

export async function fetchJobFromUrl(rawUrl: string): Promise<ScannedListing | null> {
  const parsed = parseJobUrl(rawUrl);
  if (!parsed) return null;

  if (parsed.source === "greenhouse") return fetchGreenhouseJob(parsed);
  if (parsed.source === "ashby") return fetchAshbyJob(parsed);
  return fetchLeverJob(parsed);
}
