/**
 * Greenhouse (and generic ATS) fill engine.
 * Fills résumé facts only. Never clicks Submit.
 * Works in Chrome (content script) and Node (tests via linkedom).
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.JobDeskFill = factory();
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  const SKIP =
    /why (do you|are you|this)|cover letter|tell us about|describe |essay|gender|race|ethnicity|hispanic|veteran|disability|pronoun|lgbt|sexual orientation|religion|how did you hear|eeo|equal opportunity/i;

  const MAP = [
    { key: "firstName", pattern: /first name|^first$/i },
    { key: "lastName", pattern: /last name|surname|^last$/i },
    { key: "fullName", pattern: /^(full )?name$|legal name|candidate name/i },
    { key: "email", pattern: /e-?mail/i },
    { key: "phone", pattern: /phone|mobile|whatsapp/i },
    { key: "location", pattern: /^(current )?location$|city.*country|where (are you|do you live)/i },
    { key: "city", pattern: /^city$/i },
    { key: "country", pattern: /^country$/i },
    { key: "linkedin", pattern: /linkedin/i },
    { key: "github", pattern: /github/i },
    { key: "website", pattern: /website|portfolio|personal (site|url)|homepage/i },
    { key: "workAuthorization", pattern: /work authorization|authorized to work|right to work/i },
    { key: "availability", pattern: /available|notice period|start date|how soon|join/i },
    { key: "yearsExperience", pattern: /years of experience|total experience|years.?exp/i },
    { key: "currentCtc", pattern: /current (ctc|compensation|salary|pay)/i },
    { key: "expectedCtc", pattern: /expected (ctc|compensation|salary)|salary expectation|desired (ctc|salary)|compensation expectation/i },
    { key: "productBased", pattern: /product based/i },
  ];

  const ROLE_MAP = [
    { key: "company", pattern: /^(current )?company$|employer|organization|organisation/i },
    { key: "title", pattern: /^(current )?(job )?title$|position|role title|designation/i },
    { key: "start", pattern: /start date|from date|joining date/i },
    { key: "end", pattern: /end date|to date|last date/i },
    { key: "location", pattern: /job location|work location|office location/i },
    { key: "summary", pattern: /job description|responsibilities|what did you do/i },
  ];

  const EDU_MAP = [
    { key: "school", pattern: /school|college|university|institute/i },
    { key: "degree", pattern: /degree|qualification/i },
    { key: "field", pattern: /field of study|major|discipline|specialization|specialisation/i },
    { key: "end", pattern: /graduation|year of (passing|completion)|end year/i },
  ];

  function labelFor(el) {
    const doc = el.ownerDocument;
    if (el.getAttribute("aria-label")) return el.getAttribute("aria-label");
    if (el.id && doc) {
      const byFor = doc.querySelector(`label[for="${cssEscape(el.id)}"]`);
      if (byFor) return textOf(byFor);
    }
    const wrapping = el.closest && el.closest("label");
    if (wrapping) return textOf(wrapping);
    const labelled = el.getAttribute("aria-labelledby");
    if (labelled && doc) {
      return labelled
        .split(/\s+/)
        .map((id) => doc.getElementById(id))
        .filter(Boolean)
        .map(textOf)
        .join(" ");
    }
    const prev = el.previousElementSibling;
    if (prev && /^H[1-6]|LABEL|P|SPAN|DIV|LEGEND$/.test(prev.tagName)) {
      const t = textOf(prev);
      if (t.length > 0 && t.length < 80) return t;
    }
    const parentLabel = el.parentElement && el.parentElement.querySelector("label, .label, legend");
    if (parentLabel) return textOf(parentLabel);
    return (
      el.getAttribute("placeholder") ||
      el.getAttribute("name") ||
      el.id ||
      ""
    );
  }

  function textOf(node) {
    return (node.textContent || "").replace(/\s+/g, " ").trim();
  }

  function cssEscape(value) {
    if (typeof CSS !== "undefined" && CSS.escape) return CSS.escape(value);
    return String(value).replace(/[^a-zA-Z0-9_-]/g, "\\$&");
  }

  function isFillable(el) {
    if (!el || el.disabled || el.readOnly) return false;
    if (el.type === "hidden" || el.type === "submit" || el.type === "button") return false;
    if (el.type === "file" || el.type === "checkbox" || el.type === "radio") return false;
    const tag = (el.tagName || "").toLowerCase();
    return tag === "input" || tag === "textarea" || tag === "select";
  }

  function setValue(el, value) {
    if (value == null || value === "") return false;
    const str = String(value);
    const tag = (el.tagName || "").toLowerCase();
    if (tag === "select") {
      const options = Array.from(el.options || []);
      const match =
        options.find((opt) => opt.value === str) ||
        options.find((opt) => (opt.textContent || "").trim() === str) ||
        options.find((opt) =>
          (opt.textContent || "").toLowerCase().includes(str.toLowerCase().slice(0, 24)),
        );
      if (!match) return false;
      el.value = match.value;
    } else if (el.type === "month" && /^\d{4}-\d{2}/.test(str)) {
      el.value = str.slice(0, 7);
    } else {
      el.value = str;
      try {
        const proto =
          tag === "textarea"
            ? (root().HTMLTextAreaElement || {}).prototype
            : (root().HTMLInputElement || {}).prototype;
        const desc = proto && Object.getOwnPropertyDescriptor(proto, "value");
        if (desc && desc.set) desc.set.call(el, str);
      } catch {
        /* linkedom / test DOM */
      }
    }
    try {
      el.dispatchEvent(makeEvent(el, "input"));
      el.dispatchEvent(makeEvent(el, "change"));
    } catch {
      /* some test DOMs reject synthetic events */
    }
    return true;
  }

  function makeEvent(el, type) {
    const View = el.ownerDocument && el.ownerDocument.defaultView;
    const EventCtor = (View && View.Event) || Event;
    try {
      return new EventCtor(type, { bubbles: true });
    } catch {
      return new EventCtor(type);
    }
  }

  function root() {
    return typeof window !== "undefined" ? window : globalThis;
  }

  function monthValue(iso) {
    if (!iso) return "";
    if (/^\d{4}-\d{2}/.test(iso)) return iso.slice(0, 7);
    if (/^\d{4}$/.test(iso)) return iso + "-01";
    return iso;
  }

  function displayDate(iso) {
    if (!iso) return "";
    const m = iso.match(/^(\d{4})-(\d{2})/);
    if (!m) return iso;
    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ];
    return `${months[Number(m[2]) - 1]} ${m[1]}`;
  }

  function packetValue(packet, key, role, edu) {
    if (role) {
      if (key === "start") return monthValue(role.start) || displayDate(role.start);
      if (key === "end") {
        if (role.current) return "Present";
        return monthValue(role.end) || displayDate(role.end) || "";
      }
      return role[key] ?? "";
    }
    if (edu) {
      if (key === "end") return edu.end || "";
      return edu[key] ?? "";
    }
    if (key === "yearsExperience") return String(packet.yearsExperience ?? "");
    return packet[key] ?? "";
  }

  function classify(label, name, id) {
    const hay = `${label} ${name || ""} ${id || ""}`;
    if (SKIP.test(hay)) return { skip: true };
    for (const item of MAP) {
      if (item.pattern.test(label) || item.pattern.test(name || "") || item.pattern.test(id || "")) {
        return { key: item.key };
      }
    }
    for (const item of ROLE_MAP) {
      if (item.pattern.test(label)) return { key: item.key, kind: "role" };
    }
    for (const item of EDU_MAP) {
      if (item.pattern.test(label)) return { key: item.key, kind: "edu" };
    }
    return null;
  }

  function collectFields(doc) {
    return Array.from(
      doc.querySelectorAll("input, textarea, select"),
    ).filter(isFillable);
  }

  function markSubmitButtons(doc) {
    const marked = [];
    for (const el of doc.querySelectorAll("button, input[type=submit], a, [role=button]")) {
      const text = `${el.innerText || el.textContent || el.value || ""}`.toLowerCase();
      if (/\bsubmit\b|\bapply now\b|send application|submit application/.test(text)) {
        el.setAttribute("data-job-desk-do-not-click", "true");
        if (el.style) {
          el.style.outline = "3px solid #16a34a";
        }
        marked.push(text.trim().slice(0, 40));
      }
    }
    return marked;
  }

  function applyPacket(doc, packet) {
    const filled = [];
    const skipped = [];
    const used = new Set();
    const role = packet.roles && packet.roles[0];
    const edu = packet.education && packet.education[0];
    let resumeNeeded = false;

    if (doc.querySelector("input[type=file]")) resumeNeeded = true;

    markSubmitButtons(doc);

    const byId = [
      ["first_name", "firstName"],
      ["firstName", "firstName"],
      ["last_name", "lastName"],
      ["lastName", "lastName"],
      ["email", "email"],
      ["phone", "phone"],
    ];
    for (const [id, key] of byId) {
      const el = doc.getElementById(id) || doc.querySelector(`[name="${id}"]`);
      if (el && isFillable(el) && !used.has(el) && packet[key]) {
        if (setValue(el, packet[key])) {
          used.add(el);
          filled.push(key);
        }
      }
    }

    let roleFilled = false;
    let eduFilled = false;

    for (const el of collectFields(doc)) {
      if (used.has(el)) continue;
      const label = labelFor(el);
      const info = classify(label, el.getAttribute("name"), el.id);
      if (!info) continue;
      if (info.skip) {
        skipped.push(label || el.id || "custom question");
        continue;
      }

      let value = "";
      if (info.kind === "role") {
        value = packetValue(packet, info.key, role, null);
        if (value) roleFilled = true;
      } else if (info.kind === "edu") {
        value = packetValue(packet, info.key, null, edu);
        if (value) eduFilled = true;
      } else {
        value = packetValue(packet, info.key, null, null);
      }

      if (!value) continue;
      if (setValue(el, value)) {
        used.add(el);
        filled.push(info.key);
      }
    }

    if (role && !roleFilled) {
      skipped.push("No current-employer fields found — add work history if the form asks");
    }
    if (edu && !eduFilled) {
      skipped.push("No education fields found — add school/degree if the form asks");
    }

    const extraRoles = (packet.roles || []).slice(1);
    if (extraRoles.length) {
      skipped.push(
        `${extraRoles.length} earlier role(s) not auto-added — add them if the form has Extra employment`,
      );
    }

    return {
      filled: unique(filled),
      skipped: unique(skipped),
      resumeNeeded,
      submitMarked: true,
    };
  }

  function unique(list) {
    return Array.from(new Set(list));
  }

  return {
    applyPacket,
    classify,
    markSubmitButtons,
    MAP,
    SKIP,
  };
});
