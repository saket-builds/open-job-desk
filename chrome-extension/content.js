(function () {
  if (window.__jobDeskFillBoot) return;
  window.__jobDeskFillBoot = true;

  let fillBtn = null;
  let statusEl = null;

  function createBar() {
    const bar = document.createElement("div");
    bar.id = "job-desk-fill-bar";
    bar.setAttribute("data-job-desk-fill", "toolbar");
    bar.innerHTML = `
    <span class="job-desk-fill-title">Job Desk</span>
    <button type="button" id="job-desk-fill-btn">Fill from résumé</button>
    <span id="job-desk-fill-status"></span>
  `;
    return bar;
  }

  function mountBar() {
    if (document.getElementById("job-desk-fill-bar")) return;

    const bar = createBar();
    document.documentElement.appendChild(bar);
    document.documentElement.style.scrollPaddingTop = "52px";

    fillBtn = bar.querySelector("#job-desk-fill-btn");
    statusEl = bar.querySelector("#job-desk-fill-status");
    fillBtn.addEventListener("click", () => {
      void runFill();
    });
  }

  async function runFill() {
    if (!fillBtn || !statusEl) return;
    fillBtn.disabled = true;
    statusEl.textContent = "Loading your details…";
    try {
      const payload = await chrome.runtime.sendMessage({
        type: "JOB_DESK_LOOKUP",
        url: location.href,
      });
      if (payload?.error) throw new Error(payload.error);
      if (!payload?.packet) throw new Error("No application packet returned");

      const report = window.JobDeskFill.applyPacket(document, payload.packet);
      const bits = [];
      bits.push(`Filled ${report.filled.length}`);
      if (report.skipped.length) bits.push(`left ${report.skipped.length} for you`);
      if (report.resumeNeeded) bits.push("attach résumé PDF");
      statusEl.textContent = bits.join(" · ");
    } catch (error) {
      statusEl.textContent = error instanceof Error ? error.message : "Fill failed";
    } finally {
      fillBtn.disabled = false;
    }
  }

  function ensureBar() {
    mountBar();
  }

  ensureBar();

  // Greenhouse is a React SPA — hydration often removes our bar a few seconds after load.
  const observer = new MutationObserver(() => {
    if (!document.getElementById("job-desk-fill-bar")) {
      ensureBar();
    }
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });

  window.addEventListener("popstate", () => {
    setTimeout(ensureBar, 0);
  });

  for (const method of ["pushState", "replaceState"]) {
    const original = history[method];
    history[method] = function patchedHistory(...args) {
      const result = original.apply(this, args);
      setTimeout(ensureBar, 0);
      return result;
    };
  }

  setInterval(ensureBar, 2000);
})();
