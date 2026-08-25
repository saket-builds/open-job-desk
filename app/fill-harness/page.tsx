"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import type { ApplicationPacket } from "@/lib/types";

declare global {
  interface Window {
    JobDeskFill?: {
      applyPacket: (
        doc: Document,
        packet: ApplicationPacket,
      ) => { filled: string[]; skipped: string[]; resumeNeeded: boolean };
    };
  }
}

export default function FillHarnessPage() {
  const [report, setReport] = useState<string>("");

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "/fill-helper/fill-engine.js";
    document.body.appendChild(script);
    return () => {
      script.remove();
    };
  }, []);

  async function run() {
    const res = await fetch("/api/packet");
    const body = (await res.json()) as {
      packet?: ApplicationPacket;
      error?: string;
    };
    if (!body.packet) {
      setReport(body.error ?? "No packet");
      return;
    }
    if (!window.JobDeskFill) {
      setReport("Fill engine not loaded yet — wait a second and try again.");
      return;
    }
    const result = window.JobDeskFill.applyPacket(document, body.packet);
    setReport(
      `Filled: ${result.filled.join(", ") || "none"} · Skipped: ${result.skipped.join("; ") || "none"} · Resume picker: ${result.resumeNeeded ? "yes" : "no"}`,
    );
  }

  return (
    <div className="mx-auto max-w-xl space-y-6 p-6">
      <div>
        <h1 className="text-xl font-semibold">Fill harness</h1>
        <p className="text-sm text-muted-foreground">
          Greenhouse-shaped form for testing. Does not submit anywhere.
        </p>
      </div>

      <form
        id="application-form"
        className="space-y-4 rounded-xl border border-border p-4"
        onSubmit={(event) => event.preventDefault()}
      >
        <label className="grid gap-1 text-sm">
          First name
          <input id="first_name" name="job_application[first_name]" className="h-8 rounded-lg border px-2" />
        </label>
        <label className="grid gap-1 text-sm">
          Last name
          <input id="last_name" name="job_application[last_name]" className="h-8 rounded-lg border px-2" />
        </label>
        <label className="grid gap-1 text-sm">
          Email
          <input id="email" name="job_application[email]" className="h-8 rounded-lg border px-2" />
        </label>
        <label className="grid gap-1 text-sm">
          Phone
          <input id="phone" name="job_application[phone]" className="h-8 rounded-lg border px-2" />
        </label>
        <label className="grid gap-1 text-sm">
          LinkedIn Profile
          <input name="question_linkedin" className="h-8 rounded-lg border px-2" />
        </label>
        <label className="grid gap-1 text-sm">
          GitHub
          <input name="question_github" className="h-8 rounded-lg border px-2" />
        </label>
        <label className="grid gap-1 text-sm">
          Current location
          <input name="location" className="h-8 rounded-lg border px-2" />
        </label>
        <label className="grid gap-1 text-sm">
          Current CTC
          <input name="current_ctc" className="h-8 rounded-lg border px-2" />
        </label>
        <label className="grid gap-1 text-sm">
          Expected CTC
          <input name="expected_ctc" className="h-8 rounded-lg border px-2" />
        </label>
        <label className="grid gap-1 text-sm">
          Company
          <input name="employer" className="h-8 rounded-lg border px-2" />
        </label>
        <label className="grid gap-1 text-sm">
          Job title
          <input name="job_title" className="h-8 rounded-lg border px-2" />
        </label>
        <label className="grid gap-1 text-sm">
          School
          <input name="school" className="h-8 rounded-lg border px-2" />
        </label>
        <label className="grid gap-1 text-sm">
          Degree
          <input name="degree" className="h-8 rounded-lg border px-2" />
        </label>
        <label className="grid gap-1 text-sm">
          Why do you want this role?
          <textarea name="why" className="min-h-20 rounded-lg border px-2 py-1" />
        </label>
        <label className="grid gap-1 text-sm">
          Résumé
          <input type="file" name="resume" />
        </label>
        <button type="submit">Submit application</button>
      </form>

      <Button onClick={() => void run()}>Run fill</Button>
      {report ? <p className="text-sm">{report}</p> : null}
    </div>
  );
}
