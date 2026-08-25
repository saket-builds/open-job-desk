"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CopyField } from "@/components/copy-field";
import type { ApplicationPacket, ProfileSummary } from "@/lib/types";
import { PacketEditor } from "@/components/packet-editor";

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

  useEffect(() => {
    fetch("/api/profile")
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to load profile");
        return res.json() as Promise<ProfileResponse>;
      })
      .then(setData)
      .catch((err: Error) => setError(err.message));
  }, []);

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-border px-6 py-6">
        <h1 className="text-2xl font-semibold tracking-tight">Your details</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Confirm these facts once. The Chrome helper types them into Greenhouse
          forms. You still attach the résumé PDF and click Submit yourself.
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
                <CardTitle className="text-base">Candidate</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-2">
                <CopyField label="Name" value={data.profile.name} />
                <CopyField label="Email" value={data.profile.email} />
                <CopyField label="Phone" value={data.profile.phone} />
                <CopyField label="Location" value={data.profile.location} />
                <CopyField
                  label="Work authorization"
                  value={data.profile.workAuthorization}
                />
                <CopyField
                  label="Availability"
                  value={data.profile.availability ?? "Immediate"}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Targeting</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {data.profile.roleFamilies.map((item) => (
                    <Badge key={item} variant="outline">
                      {item}
                    </Badge>
                  ))}
                  {data.profile.seniority.map((item) => (
                    <Badge key={item} variant="outline">
                      {item}
                    </Badge>
                  ))}
                  {data.profile.workModes.map((item) => (
                    <Badge key={item} variant="outline">
                      {item}
                    </Badge>
                  ))}
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <CopyField
                    label="Target locations"
                    value={data.profile.targetLocations.join(", ")}
                  />
                  <CopyField
                    label="Submission mode"
                    value={data.profile.submissionMode}
                  />
                  <CopyField
                    label="Years experience"
                    value={String(data.profile.yearsExperience)}
                  />
                  <CopyField
                    label="Auto-submit min score"
                    value={String(data.profile.autoSubmitMinScore)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Compensation (CTC)</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3">
                <CopyField
                  label="Current CTC (when asked)"
                  value={data.profile.currentCompensation ?? ""}
                />
                <CopyField
                  label="Expected CTC (when asked)"
                  value={data.profile.targetCompensation ?? ""}
                />
              </CardContent>
            </Card>

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
              </CardContent>
            </Card>

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
