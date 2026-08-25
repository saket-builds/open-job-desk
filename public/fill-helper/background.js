const DEFAULT_DESK = "http://localhost:3000";

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type !== "JOB_DESK_LOOKUP") return;
  lookup(message.url)
    .then(sendResponse)
    .catch((error) => sendResponse({ error: error.message || "Lookup failed" }));
  return true;
});

async function lookup(pageUrl) {
  const { deskUrl, fillToken } = await chrome.storage.sync.get({
    deskUrl: DEFAULT_DESK,
    fillToken: "",
  });
  if (!fillToken) {
    throw new Error("Add the fill token from Your details in the extension popup.");
  }
  const endpoint = new URL("/api/fill/lookup", deskUrl.replace(/\/$/, ""));
  endpoint.searchParams.set("url", pageUrl || "");
  const res = await fetch(endpoint.toString(), {
    headers: { "x-fill-token": fillToken },
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.error || `Lookup failed (${res.status})`);
  return body;
}
