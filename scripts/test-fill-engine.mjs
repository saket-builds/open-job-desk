import { createRequire } from "node:module";
import { parseHTML } from "linkedom";
import { DEFAULT_PACKET } from "../lib/packet.ts";

const require = createRequire(import.meta.url);
const { applyPacket, classify } = require("../chrome-extension/fill-engine.js");

const html = `<!doctype html>
<form id="application-form">
  <label>First name <input id="first_name" name="job_application[first_name]" /></label>
  <label>Last name <input id="last_name" name="job_application[last_name]" /></label>
  <label>Email <input id="email" /></label>
  <label>Phone <input id="phone" /></label>
  <label>LinkedIn Profile <input name="linkedin" /></label>
  <label>Current location <input name="location" /></label>
  <label>Current CTC <input name="current_ctc" /></label>
  <label>Expected CTC <input name="expected_ctc" /></label>
  <label>Company <input name="employer" /></label>
  <label>Job title <input name="title" /></label>
  <label>School <input name="school" /></label>
  <label>Degree <input name="degree" /></label>
  <label>Why do you want this role? <textarea name="why"></textarea></label>
  <input type="file" name="resume" />
  <button type="submit">Submit application</button>
</form>`;

const { document } = parseHTML(html);
const report = applyPacket(document, DEFAULT_PACKET);

function assert(cond, message) {
  if (!cond) throw new Error(message);
}

assert(document.getElementById("first_name").value === "Jordan", "first name");
assert(document.getElementById("last_name").value === "Lee", "last name");
assert(document.getElementById("email").value === "jordan.lee@example.com", "email");
assert(document.getElementById("phone").value.includes("555-0100"), "phone");
assert(document.querySelector("[name=linkedin]").value.includes("linkedin.com"), "linkedin");
assert(document.querySelector("[name=employer]").value === "Demo Startup", "employer");
assert(document.querySelector("[name=title]").value === "AI Engineer", "title");
assert(document.querySelector("[name=school]").value.includes("Demo Institute"), "school");
assert(document.querySelector("[name=why]").value === "", "must not fill essay");
assert(
  document.querySelector("[type=submit]").getAttribute("data-job-desk-do-not-click") === "true",
  "must not click submit",
);
assert(report.resumeNeeded === true, "resume picker flagged");
assert(report.filled.includes("firstName"), "report firstName");
assert(classify("Why do you want this role?").skip === true, "skip why");
assert(classify("Email").key === "email", "email classify");

console.log("fill-engine tests passed", report.filled.join(","));
