"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CopyField } from "@/components/copy-field";
import type { ApplicationPacket, ProfileSummary } from "@/lib/types";
import { PacketEditor } from "@/components/packet-editor";
import { TargetingEditor } from "@/components/targeting-editor";

interface ProfileResponse {
  check: { configured: boolean; missing: string[] };
  profile: ProfileSummary;
  resume: { path: string; sha256?: string; bytes?: number };
  packet?: ApplicationPacket;
  fillToken?: string;
}

export function ProfilePageClient() {
  const [data, setData] = useState<ProfileResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [resumeMsg, setResumeMsg] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  function load() {
    fetch("/api/profile")
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to load profile");
        return res.json() as Promise<ProfileResponse>;
      })
      .then(setData)
      .catch((err: Error) => setError(err.message));
  }

  useEffect(() => {
    load();
  }, []);

  async function onResumeSelected(file: File | null) {
    if (!file) return;
    setUploading(true);
    setResumeMsg(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/resume", { method: "POST", body: form });
      const body = (await res.json()) as {
        resume?: ProfileResponse["resume"];
        error?: string;
      };
      if (!res.ok) throw new Error(body.error ?? "Upload failed");
      setResumeMsg("Résumé uploaded.");
      setData((prev) =>
        prev && body.resume ? { ...prev, resume: body.resume } : prev,
      );
    } catch (err) {
      setResumeMsg(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-border px-6 py-6">
        <h1 className="text-2xl font-semibold tracking-tight">Your details</h1>
        <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
          Set your facts, targeting, and discovery rules for any job sector.
          The Chrome helper fills Greenhouse forms from the application packet —
          you still attach the résumé PDF and click Submit yourself.
        </p>
      </header>

      <div className="flex flex-1 flex-col gap-6 p-6">
        {error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : !data ? (
          <p className="text-sm text-muted-foreground">Loading profile…</p>
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Résumé</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <CopyField label="Canonical PDF" value={data.resume.path} mono />
                {data.resume.bytes ? (
                  <p className="text-xs text-muted-foreground">
                    {Math.round(data.resume.bytes / 1024)} KB
                    {data.resume.sha256
                      ? ` · sha256 ${data.resume.sha256.slice(0, 12)}…`
                      : ""}
                  </p>
                ) : null}
                <div className="flex flex-wrap items-center gap-3">
                  <label
                    className={`inline-flex h-7 cursor-pointer items-center rounded-lg border border-border px-2.5 text-[0.8rem] font-medium hover:bg-muted ${uploading ? "pointer-events-none opacity-50" : ""}`}
                  >
                    {uploading ? "Uploading…" : "Upload PDF"}
                    <input
                      type="file"
                      accept="application/pdf,.pdf"
                      className="hidden"
                      disabled={uploading}
                      onChange={(event) =>
                        void onResumeSelected(event.target.files?.[0] ?? null)
                      }
                    />
                  </label>
                  {resumeMsg ? (
                    <p className="text-sm text-muted-foreground">{resumeMsg}</p>
                  ) : null}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Current targeting snapshot</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {data.profile.roleFamilies.map((item) => (
                    <Badge key={item} variant="outline">
                      {item}
                    </Badge>
                  ))}
                  {data.profile.seniority.map((item) => (
                    <Badge key={`s-${item}`} variant="outline">
                      {item}
                    </Badge>
                  ))}
                  {data.profile.workModes.map((item) => (
                    <Badge key={`w-${item}`} variant="outline">
                      {item}
                    </Badge>
                  ))}
                  {data.profile.discovery.openTitleMatching ? (
                    <Badge variant="secondary">Open titles</Badge>
                  ) : null}
                </div>
                <p className="text-sm text-muted-foreground">
                  Home markets:{" "}
                  {data.profile.targetLocations.join(", ") || "not set"} · Edit
                  rules below for non-AI sectors or other countries.
                </p>
              </CardContent>
            </Card>

            <TargetingEditor
              initial={data.profile}
              onSaved={(profile) =>
                setData((prev) => (prev ? { ...prev, profile } : prev))
              }
            />

            {data.packet && data.fillToken ? (
              <PacketEditor
                initial={data.packet}
                fillToken={data.fillToken}
              />
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
