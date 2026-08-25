import { corsEmpty, corsJson } from "@/lib/cors";
import { getPacketAndToken } from "@/lib/packet-service";
import { getResumeInfo } from "@/lib/profile-service";
import { getPipelineJob } from "@/lib/pipeline";

export async function OPTIONS() {
  return corsEmpty();
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const job = await getPipelineJob(id);
  if (!job) {
    return corsJson({ error: "Job not found" }, { status: 404 });
  }
  if (
    job.deskStatus !== "approved" &&
    job.deskStatus !== "needs-you" &&
    job.deskStatus !== "ready"
  ) {
    return corsJson(
      { error: "Job must be approved before fill-prep" },
      { status: 403 },
    );
  }

  const [{ packet }, resume] = await Promise.all([
    getPacketAndToken(),
    getResumeInfo(),
  ]);

  return corsJson({
    id: job.id,
    url: job.url,
    company: job.company,
    title: job.title,
    source: job.source,
    resumePath: resume.path,
    knockouts: job.knockouts ?? job.blockers ?? [],
    answers: job.preparedAnswers ?? {},
    packet,
    fields: {
      firstName: packet.firstName,
      lastName: packet.lastName,
      email: packet.email,
      phone: packet.phone,
      location: packet.location,
      linkedin: packet.linkedin,
      github: packet.github,
      website: packet.website,
      currentCtc: packet.currentCtc,
      expectedCtc: packet.expectedCtc,
      availability: packet.availability,
      productBased: packet.productBased,
    },
  });
}
