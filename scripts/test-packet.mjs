import {
  DEFAULT_PACKET,
  packetFromProfile,
  sanitizePacket,
  splitName,
} from "../lib/packet.ts";

function assert(cond, message) {
  if (!cond) throw new Error(message);
}

assert(splitName("Jordan Lee").firstName === "Jordan", "split first");
assert(splitName("Jordan Lee").lastName === "Lee", "split last");

const profile = {
  name: "Jordan Lee",
  email: "jordan.lee@example.com",
  phone: "+1-555-0100",
  location: "Bangalore, India",
  workAuthorization: "Authorized to work in India.",
  yearsExperience: 4,
  roleFamilies: [],
  seniority: [],
  skills: [],
  targetLocations: [],
  workModes: [],
  industries: [],
  submissionMode: "review-each",
  autoSubmitMinScore: 80,
  manualReviewMinScore: 70,
  minMustHaveCoverage: 70,
  excludedCompanies: [],
};

const fromProfile = packetFromProfile(profile);
assert(fromProfile.city === "Bangalore", "city");
assert(fromProfile.roles.length >= 3, "roles from résumé");
assert(fromProfile.education.length >= 1, "education from résumé");

const cleaned = sanitizePacket({
  ...DEFAULT_PACKET,
  roles: [{ company: "", title: "X", start: "2020-01" }, DEFAULT_PACKET.roles[0]],
});
assert(cleaned.roles.length === 1, "drop incomplete roles");
assert(cleaned.roles[0].company === "Demo Startup", "keep valid role");

console.log("packet tests passed");
