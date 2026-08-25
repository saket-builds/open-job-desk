const base = process.argv[2] || "http://localhost:3000";

function assert(cond, message) {
  if (!cond) throw new Error(message);
}

const packetRes = await fetch(`${base}/api/packet`);
const packetBody = await packetRes.json();
assert(packetRes.ok, packetBody.error || "packet GET failed");
assert(packetBody.packet?.firstName === "Jordan", "packet firstName");
assert(Array.isArray(packetBody.packet?.roles) && packetBody.packet.roles.length >= 2, "roles");
assert(packetBody.fillToken && packetBody.fillToken.length >= 16, "fill token");

const lookupRes = await fetch(
  `${base}/api/fill/lookup?url=${encodeURIComponent("https://job-boards.greenhouse.io/fourkites/jobs/7981512")}`,
  { headers: { "x-fill-token": packetBody.fillToken } },
);
const lookup = await lookupRes.json();
assert(lookupRes.ok, lookup.error || "lookup failed");
assert(lookup.packet?.email === packetBody.packet.email, "lookup packet");

const bad = await fetch(`${base}/api/fill/lookup`, {
  headers: { "x-fill-token": "not-a-real-token" },
});
assert(bad.status === 401, "bad token rejected");

const options = await fetch(`${base}/api/fill/lookup`, { method: "OPTIONS" });
assert(options.status === 204, "CORS preflight");
assert(options.headers.get("access-control-allow-origin") === "*", "CORS origin");

const zip = await fetch(`${base}/job-desk-fill-helper.zip`);
assert(zip.ok, "helper zip missing");

const engine = await fetch(`${base}/fill-helper/fill-engine.js`);
assert(engine.ok, "fill-engine.js missing");

console.log(`e2e API passed against ${base}`);
console.log(`token prefix ${packetBody.fillToken.slice(0, 6)}…`);
if (lookup.job) console.log(`matched job ${lookup.job.company} (${lookup.job.deskStatus})`);
else console.log("no pipeline job matched FourKites URL (packet still returned)");
