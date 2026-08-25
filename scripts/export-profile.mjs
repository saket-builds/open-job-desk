import { spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";

const script = join(
  homedir(),
  ".agents",
  "skills",
  "job-application-agent",
  "scripts",
  "job-application.mjs",
);

const fields = [
  "name",
  "email",
  "phone",
  "location",
  "workAuthorization",
  "linkedin",
  "github",
  "portfolio",
  "availability",
  "currentCompensation",
  "targetCompensation",
  "roleFamilies",
  "seniority",
  "skills",
  "targetLocations",
  "workModes",
  "industries",
  "submissionMode",
  "yearsExperience",
  "autoSubmitMinScore",
  "manualReviewMinScore",
  "minMustHaveCoverage",
  "excludedCompanies",
];

function runAgent(args) {
  return new Promise((resolve, reject) => {
    const proc = spawn("node", [script, ...args], {
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stdout = "";
    proc.stdout.on("data", (c) => {
      stdout += c;
    });
    proc.on("close", (code) => {
      if (code !== 0) reject(new Error("agent failed"));
      else resolve(JSON.parse(stdout));
    });
  });
}

const profile = {};
for (const field of fields) {
  const result = await runAgent(["profile", "field", field]);
  profile[field] = result[field];
}

await mkdir("data", { recursive: true });
await writeFile(
  "data/profile.vercel.json",
  `${JSON.stringify(profile, null, 2)}\n`,
);
console.log("Wrote data/profile.vercel.json");
