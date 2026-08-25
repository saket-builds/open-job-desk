import type { ApplicationPacket, EducationEntry, ProfileSummary, WorkRole } from "./types";

/** Fictional demo packet for forks — replace with your own on Your details. */
export const DEFAULT_PACKET: ApplicationPacket = {
  firstName: "Jordan",
  lastName: "Lee",
  fullName: "Jordan Lee",
  email: "jordan.lee@example.com",
  phone: "+1-555-0100",
  location: "Bangalore, India",
  city: "Bangalore",
  country: "India",
  linkedin: "https://www.linkedin.com/in/jordan-lee-demo/",
  github: "https://github.com/jordan-lee-demo",
  website: "https://example.com/jordan-lee",
  workAuthorization:
    "Authorized to work in India. Available for Bangalore on-site/hybrid and remote roles that hire India-based employees.",
  availability: "Immediate",
  yearsExperience: 4,
  currentCtc:
    "Current compensation is equity-based at an early-stage startup, so there isn't a traditional fixed annual CTC to quote.",
  expectedCtc:
    "Expected compensation is aligned with Bangalore market rates for Applied AI / GenAI engineer roles with production delivery experience.",
  productBased: "Yes",
  roles: [
    {
      company: "Demo Startup",
      title: "AI Engineer",
      start: "2024-04",
      location: "Bangalore, India",
      current: true,
      summary:
        "Building an enterprise voice AI receptionist with RAG, FastAPI, and LangGraph.",
    },
    {
      company: "Example Corp",
      title: "Software Developer",
      start: "2020-12",
      end: "2024-02",
      location: "Bangalore, India",
      current: false,
      summary:
        "Production backends: Java, REST APIs, security reviews, MQTT.",
    },
    {
      company: "Sample Labs",
      title: "Java Developer Intern",
      start: "2020-01",
      end: "2020-08",
      location: "India",
      current: false,
      summary: "Spring Boot REST APIs for an online ordering platform.",
    },
  ],
  education: [
    {
      school: "Demo Institute of Technology",
      degree: "B.Tech",
      field: "Information Technology",
      start: "2016",
      end: "2020",
    },
    {
      school: "Online Academy",
      degree: "Certified Java Full Stack Developer",
      field: "Software Engineering",
      end: "2021",
    },
  ],
};

export function splitName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { firstName: "", lastName: "" };
  if (parts.length === 1) return { firstName: parts[0], lastName: parts[0] };
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
}

export function packetFromProfile(profile: ProfileSummary): ApplicationPacket {
  const names = splitName(profile.name);
  return {
    ...DEFAULT_PACKET,
    firstName: names.firstName,
    lastName: names.lastName,
    fullName: profile.name,
    email: profile.email,
    phone: profile.phone,
    location: profile.location,
    city: profile.location.split(",")[0]?.trim() || DEFAULT_PACKET.city,
    country: /india/i.test(profile.location) ? "India" : DEFAULT_PACKET.country,
    linkedin: profile.linkedin ?? DEFAULT_PACKET.linkedin,
    github: profile.github ?? DEFAULT_PACKET.github,
    website: profile.portfolio ?? DEFAULT_PACKET.website,
    workAuthorization: profile.workAuthorization,
    availability: profile.availability ?? "Immediate",
    yearsExperience: profile.yearsExperience,
    currentCtc: profile.currentCompensation ?? DEFAULT_PACKET.currentCtc,
    expectedCtc: profile.targetCompensation ?? DEFAULT_PACKET.expectedCtc,
  };
}

function cleanRole(role: Partial<WorkRole>): WorkRole | null {
  const company = String(role.company ?? "").trim();
  const title = String(role.title ?? "").trim();
  const start = String(role.start ?? "").trim();
  if (!company || !title || !start) return null;
  return {
    company,
    title,
    start,
    end: String(role.end ?? "").trim() || undefined,
    location: String(role.location ?? "").trim(),
    current: Boolean(role.current),
    summary: String(role.summary ?? "").trim() || undefined,
  };
}

function cleanEducation(entry: Partial<EducationEntry>): EducationEntry | null {
  const school = String(entry.school ?? "").trim();
  const degree = String(entry.degree ?? "").trim();
  if (!school || !degree) return null;
  return {
    school,
    degree,
    field: String(entry.field ?? "").trim(),
    start: String(entry.start ?? "").trim() || undefined,
    end: String(entry.end ?? "").trim() || undefined,
  };
}

export function sanitizePacket(
  input: Partial<ApplicationPacket>,
  fallback: ApplicationPacket = DEFAULT_PACKET,
): ApplicationPacket {
  const fullName = String(input.fullName ?? fallback.fullName).trim();
  const names = splitName(fullName);
  const roles = Array.isArray(input.roles)
    ? input.roles.map(cleanRole).filter((role): role is WorkRole => role != null)
    : fallback.roles;
  const education = Array.isArray(input.education)
    ? input.education
        .map(cleanEducation)
        .filter((entry): entry is EducationEntry => entry != null)
    : fallback.education;

  return {
    firstName: String(input.firstName ?? names.firstName).trim() || names.firstName,
    lastName: String(input.lastName ?? names.lastName).trim() || names.lastName,
    fullName,
    email: String(input.email ?? fallback.email).trim(),
    phone: String(input.phone ?? fallback.phone).trim(),
    location: String(input.location ?? fallback.location).trim(),
    city: String(input.city ?? fallback.city).trim(),
    country: String(input.country ?? fallback.country).trim(),
    linkedin: String(input.linkedin ?? fallback.linkedin).trim(),
    github: String(input.github ?? fallback.github).trim(),
    website: String(input.website ?? fallback.website).trim(),
    workAuthorization: String(
      input.workAuthorization ?? fallback.workAuthorization,
    ).trim(),
    availability: String(input.availability ?? fallback.availability).trim(),
    yearsExperience: Number(input.yearsExperience ?? fallback.yearsExperience) || 0,
    currentCtc: String(input.currentCtc ?? fallback.currentCtc).trim(),
    expectedCtc: String(input.expectedCtc ?? fallback.expectedCtc).trim(),
    productBased: String(input.productBased ?? fallback.productBased).trim() || "Yes",
    roles,
    education,
  };
}
