import { corsEmpty, corsJson } from "@/lib/cors";
import { getPacketAndToken, tokenMatches } from "@/lib/packet-service";
import { listPipelineJobs } from "@/lib/pipeline";

function normalizeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    parsed.hash = "";
    parsed.searchParams.delete("utm_source");
    parsed.searchParams.delete("utm_medium");
    parsed.searchParams.delete("utm_campaign");
    parsed.searchParams.delete("gh_src");
    parsed.searchParams.delete("gh_jid");
    return parsed.toString().replace(/\/$/, "");
  } catch {
    return url.split("?")[0];
  }
}

export async function OPTIONS() {
  return corsEmpty();
}

export async function GET(request: Request) {
  if (!(await tokenMatches(request))) {
    return corsJson({ error: "Invalid fill token" }, { status: 401 });
  }

  const { packet } = await getPacketAndToken();
  const pageUrl = new URL(request.url).searchParams.get("url") ?? "";
  const jobs = await listPipelineJobs();
  const match = pageUrl
    ? jobs.find((job) => normalizeUrl(job.url) === normalizeUrl(pageUrl))
    : undefined;

  return corsJson({
    packet,
    job: match
      ? {
          id: match.id,
          title: match.title,
          company: match.company,
          url: match.url,
          source: match.source,
          deskStatus: match.deskStatus,
          knockouts: match.knockouts ?? match.blockers ?? [],
        }
      : null,
    resumeHint:
      "Attach the canonical résumé PDF yourself — Chrome cannot upload a disk file for you.",
  });
}
