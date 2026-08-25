import { homedir } from "node:os";
import { join } from "node:path";

const args = process.argv.slice(2);
const id = argValue("--id");
const api = argValue("--api") ?? process.env.JOB_DESK_URL ?? "http://localhost:3000";
const resumeOverride = argValue("--resume");

function argValue(flag) {
  const index = args.indexOf(flag);
  if (index === -1) return undefined;
  return args[index + 1];
}

if (!id) {
  console.error("Usage: npm run fill -- --id <job-id>");
  console.error("Optional: --api http://localhost:3000 --resume C:\\path\\resume.pdf");
  process.exit(1);
}

let playwright;
try {
  playwright = await import("playwright");
} catch {
  console.error("Playwright is not installed. From job-desk run:");
  console.error("  npm i -D playwright");
  console.error("  npx playwright install chromium");
  process.exit(1);
}

const response = await fetch(`${api.replace(/\/$/, "")}/api/fill/${id}`);
if (!response.ok) {
  const body = await response.text();
  console.error(`Fill payload failed (${response.status}): ${body}`);
  process.exit(1);
}

const payload = await response.json();
const resumePath =
  resumeOverride ||
  (payload.resumePath && !payload.resumePath.startsWith("http")
    ? payload.resumePath
    : join(homedir(), "AppData", "Roaming", "job-application-agent", "resume.pdf"));

console.log(`Opening ${payload.company} — ${payload.title}`);
console.log(`URL: ${payload.url}`);
console.log("Knock-outs:");
for (const item of payload.knockouts ?? []) console.log(`  - ${item}`);
console.log("This script fills the form and uploads the resume. It NEVER clicks Submit.");

const browser = await playwright.chromium.launch({ headless: false });
const page = await browser.newPage();
await page.goto(payload.url, { waitUntil: "domcontentloaded", timeout: 60_000 });
await page.waitForTimeout(1500);

const packet = payload.packet ?? {};
const fields = {
  firstName: packet.firstName ?? payload.fields?.firstName,
  lastName: packet.lastName ?? payload.fields?.lastName,
  email: packet.email ?? payload.fields?.email,
  phone: packet.phone ?? payload.fields?.phone,
  location: packet.location ?? payload.fields?.location,
  linkedin: packet.linkedin ?? payload.fields?.linkedin,
  github: packet.github ?? payload.fields?.github,
  website: packet.website ?? payload.fields?.website,
  currentCtc: packet.currentCtc ?? payload.fields?.currentCtc,
  expectedCtc: packet.expectedCtc ?? payload.fields?.expectedCtc,
  availability: packet.availability ?? payload.fields?.availability,
  productBased: packet.productBased ?? payload.fields?.productBased,
};

async function fillByRegex(pattern, value) {
  if (!value) return;
  const locator = page.getByLabel(pattern).first();
  if (await locator.count()) {
    await locator.fill(value).catch(() => {});
    return;
  }
  const named = page.locator(
    `input[name*="${pattern.source.replace(/[^a-z]/gi, "")}" i], textarea[name*="${pattern.source.replace(/[^a-z]/gi, "")}" i]`,
  ).first();
  if (await named.count()) await named.fill(value).catch(() => {});
}

await fillByRegex(/first name/i, fields.firstName);
await fillByRegex(/last name/i, fields.lastName);
await fillByRegex(/^name$|full name/i, `${fields.firstName} ${fields.lastName}`.trim());
await fillByRegex(/email/i, fields.email);
await fillByRegex(/phone|mobile/i, fields.phone);
await fillByRegex(/linkedin/i, fields.linkedin);
await fillByRegex(/github/i, fields.github);
await fillByRegex(/website|portfolio|personal site/i, fields.website);
await fillByRegex(/location|city|current location/i, fields.location);
await fillByRegex(/current (ctc|compensation|salary)/i, fields.currentCtc);
await fillByRegex(/expected (ctc|compensation|salary)|salary expectation/i, fields.expectedCtc);
await fillByRegex(/available|notice|join/i, fields.availability);
await fillByRegex(/product based/i, fields.productBased);
await fillByRegex(/company|employer/i, packet.roles?.[0]?.company);
await fillByRegex(/job title|current title/i, packet.roles?.[0]?.title);
await fillByRegex(/school|college|university/i, packet.education?.[0]?.school);
await fillByRegex(/^degree$/i, packet.education?.[0]?.degree);

const fileInput = page.locator('input[type="file"]').first();
if (await fileInput.count()) {
  await fileInput.setInputFiles(resumePath).catch((error) => {
    console.error(`Resume attach failed: ${error.message}`);
    console.error(`Attach manually from: ${resumePath}`);
  });
} else {
  console.log(`No file input found. Attach resume manually: ${resumePath}`);
}

await page.evaluate(() => {
  for (const el of document.querySelectorAll("button, input[type=submit], a")) {
    const text = (el.innerText || el.value || "").toLowerCase();
    if (/\bsubmit\b|\bapply\b|send application/.test(text)) {
      el.setAttribute("data-job-desk-do-not-click", "true");
      el.style.outline = "3px solid #16a34a";
    }
  }
});

console.log("Form is filled as far as possible. Review knock-outs, then YOU click Submit.");
console.log("Close the browser window when done. This process will wait.");
await page.pause();
await browser.close();
