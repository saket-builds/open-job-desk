const DEFAULT_DESK = "http://localhost:3000";

const deskUrl = document.getElementById("deskUrl");
const fillToken = document.getElementById("fillToken");
const status = document.getElementById("status");

chrome.storage.sync.get({ deskUrl: DEFAULT_DESK, fillToken: "" }, (stored) => {
  deskUrl.value = stored.deskUrl || DEFAULT_DESK;
  fillToken.value = stored.fillToken || "";
});

document.getElementById("save").addEventListener("click", () => {
  chrome.storage.sync.set(
    {
      deskUrl: deskUrl.value.trim() || DEFAULT_DESK,
      fillToken: fillToken.value.trim(),
    },
    () => {
      status.textContent = "Saved. Open a Greenhouse job and tap Fill from résumé.";
    },
  );
});
