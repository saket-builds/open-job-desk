import type { ProfileSummary } from "./types";

export function buildApplicationAnswers(
  profile: ProfileSummary,
): Record<string, string> {
  return {
    "Full name": profile.name,
    Email: profile.email,
    Phone: profile.phone,
    Location: profile.location,
    "Work authorization": profile.workAuthorization,
    LinkedIn: profile.linkedin ?? "",
    GitHub: profile.github ?? "",
    Portfolio: profile.portfolio ?? "",
    Availability: profile.availability ?? "Immediate",
    "Years of experience": String(profile.yearsExperience),
    "Current company type":
      profile.companyTypeAnswer ?? "Product-based company",
    "Are you from Product based organisation?": "Yes",
    "How soon are you available to join?": "Immediate",
    "Current CTC / current compensation": profile.currentCompensation ?? "",
    "Expected CTC / expected compensation": profile.targetCompensation ?? "",
    "Salary expectations": profile.targetCompensation ?? "",
  };
}
