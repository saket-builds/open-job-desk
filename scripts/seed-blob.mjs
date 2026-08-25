import { readFile } from "node:fs/promises";
import { put } from "@vercel/blob";

const state = JSON.parse(await readFile("data/initial-state.json", "utf8"));

if (!process.env.BLOB_READ_WRITE_TOKEN) {
  console.error("Set BLOB_READ_WRITE_TOKEN before running this script.");
  process.exit(1);
}

await put("job-desk/state.json", JSON.stringify(state), {
  access: "private",
  addRandomSuffix: false,
  allowOverwrite: true,
  contentType: "application/json",
});

console.log("Uploaded initial state to Vercel Blob");
