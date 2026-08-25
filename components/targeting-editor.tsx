"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { DiscoveryPortal, ProfileSummary } from "@/lib/types";

interface TargetingEditorProps {
  initial: ProfileSummary;
  onSaved?: (profile: ProfileSummary) => void;
}

function csv(value: string[]): string {
  return value.join(", ");
}

function splitCsv(value: string): string[] {
  return value
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}

function lines(value: string[]): string {
  return value.join("\n");
}

function splitLines(value: string): string[] {
  return value
    .split("\n")
    .map((part) => part.trim())
    .filter(Boolean);
}

/** Escape a plain word for use inside a regex. */
function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Plain words → `\bword\b` patterns. Lines that already look like regex are kept. */
function wordsToPatterns(text: string): string[] {
  return splitLines(text).map((word) => {
    if (/[\\[\]()*+?|{}^$]/.test(word)) return word;
    return String.raw`\b` + escapeRegex(word) + String.raw`\b`;
  });
}

/** Best-effort: show `\bfoo\b` as `foo` for normal people. Complex rules stay as-is. */
function patternsToWords(patterns: string[]): string {
  return patterns
    .map((pattern) => {
      const trimmed = pattern.trim();
      const match = trimmed.match(/^\\b(.+)\\b$/);
      if (!match) return trimmed;
      const inner = match[1];
      if (/[\\[\]()*+?|{}^$]/.test(inner)) return trimmed;
      return inner;
    })
    .join("\n");
}

function hasComplexPatterns(patterns: string[]): boolean {
  return patterns.some((pattern) => {
    const trimmed = pattern.trim();
    const match = trimmed.match(/^\\b(.+)\\b$/);
    if (!match) return /[\\[\]()*+?|{}^$]/.test(trimmed);
    return /[\\[\]()*+?|{}^$]/.test(match[1]);
  });
}

export function TargetingEditor({ initial, onSaved }: TargetingEditorProps) {
  const [profile, setProfile] = useState(initial);
  const [portalsText, setPortalsText] = useState(
    initial.discovery.portals
      .map((portal) => `${portal.source}:${portal.board}:${portal.name}`)
      .join("\n"),
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(
    hasComplexPatterns([
      ...initial.discovery.homeLocationPatterns,
      ...initial.discovery.titleHardPatterns,
      ...initial.discovery.titleSoftPatterns,
      ...initial.discovery.jdSignalPatterns,
    ]),
  );

  function patch(partial: Partial<ProfileSummary>) {
    setProfile((prev) => ({ ...prev, ...partial }));
  }

  function patchDiscovery(
    partial: Partial<ProfileSummary["discovery"]>,
  ) {
    setProfile((prev) => ({
      ...prev,
      discovery: { ...prev.discovery, ...partial },
    }));
  }

  function parsePortals(text: string): DiscoveryPortal[] {
    return text
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [source, board, ...nameParts] = line.split(":");
        const name = nameParts.join(":").trim() || board?.trim() || "";
        return {
          source: source?.trim() as DiscoveryPortal["source"],
          board: board?.trim() || "",
          name,
        };
      })
      .filter(
        (portal) =>
          portal.board &&
          portal.name &&
          (portal.source === "greenhouse" ||
            portal.source === "ashby" ||
            portal.source === "lever"),
      );
  }

  async function save() {
    setSaving(true);
    setMessage(null);
    try {
      const next: ProfileSummary = {
        ...profile,
        discovery: {
          ...profile.discovery,
          portals: parsePortals(portalsText),
        },
      };
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile: next }),
      });
      const body = (await res.json()) as {
        profile?: ProfileSummary;
        error?: string;
      };
      if (!res.ok) throw new Error(body.error ?? "Save failed");
      if (body.profile) {
        setProfile(body.profile);
        setPortalsText(
          body.profile.discovery.portals
            .map((portal) => `${portal.source}:${portal.board}:${portal.name}`)
            .join("\n"),
        );
        onSaved?.(body.profile);
      }
      setMessage("Targeting saved. Find new jobs will use these rules.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Candidate facts</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          {(
            [
              ["name", "Name"],
              ["email", "Email"],
              ["phone", "Phone"],
              ["location", "Location"],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="space-y-1 text-sm">
              <span className="text-muted-foreground">{label}</span>
              <Input
                value={String(profile[key] ?? "")}
                onChange={(event) => patch({ [key]: event.target.value })}
              />
            </label>
          ))}
          <label className="space-y-1 text-sm sm:col-span-2">
            <span className="text-muted-foreground">Work authorization</span>
            <Input
              value={profile.workAuthorization}
              onChange={(event) =>
                patch({ workAuthorization: event.target.value })
              }
            />
          </label>
          <label className="space-y-1 text-sm">
            <span className="text-muted-foreground">Years experience</span>
            <Input
              type="number"
              value={profile.yearsExperience}
              onChange={(event) =>
                patch({ yearsExperience: Number(event.target.value) || 0 })
              }
            />
          </label>
          <label className="space-y-1 text-sm">
            <span className="text-muted-foreground">Availability</span>
            <Input
              value={profile.availability ?? ""}
              onChange={(event) => patch({ availability: event.target.value })}
            />
          </label>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Targeting</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <label className="space-y-1 text-sm sm:col-span-2">
            <span className="text-muted-foreground">
              Role families (comma-separated)
            </span>
            <Input
              value={csv(profile.roleFamilies)}
              onChange={(event) =>
                patch({ roleFamilies: splitCsv(event.target.value) })
              }
            />
          </label>
          <label className="space-y-1 text-sm sm:col-span-2">
            <span className="text-muted-foreground">
              Skills (comma-separated — used for must-have pills)
            </span>
            <Input
              value={csv(profile.skills)}
              onChange={(event) =>
                patch({ skills: splitCsv(event.target.value) })
              }
            />
          </label>
          <label className="space-y-1 text-sm">
            <span className="text-muted-foreground">Seniority targets</span>
            <Input
              value={csv(profile.seniority)}
              onChange={(event) =>
                patch({ seniority: splitCsv(event.target.value) })
              }
            />
          </label>
          <label className="space-y-1 text-sm">
            <span className="text-muted-foreground">Work modes</span>
            <Input
              value={csv(profile.workModes)}
              onChange={(event) =>
                patch({ workModes: splitCsv(event.target.value) })
              }
            />
          </label>
          <label className="space-y-1 text-sm">
            <span className="text-muted-foreground">Target locations</span>
            <Input
              value={csv(profile.targetLocations)}
              onChange={(event) =>
                patch({ targetLocations: splitCsv(event.target.value) })
              }
            />
          </label>
          <label className="space-y-1 text-sm">
            <span className="text-muted-foreground">Industries</span>
            <Input
              value={csv(profile.industries)}
              onChange={(event) =>
                patch({ industries: splitCsv(event.target.value) })
              }
            />
          </label>
          <label className="space-y-1 text-sm">
            <span className="text-muted-foreground">Manual review min score</span>
            <Input
              type="number"
              value={profile.manualReviewMinScore}
              onChange={(event) =>
                patch({
                  manualReviewMinScore: Number(event.target.value) || 0,
                })
              }
            />
          </label>
          <label className="space-y-1 text-sm">
            <span className="text-muted-foreground">Min must-have coverage %</span>
            <Input
              type="number"
              value={profile.minMustHaveCoverage}
              onChange={(event) =>
                patch({
                  minMustHaveCoverage: Number(event.target.value) || 0,
                })
              }
            />
          </label>
          <label className="space-y-1 text-sm sm:col-span-2">
            <span className="text-muted-foreground">Current CTC text</span>
            <Input
              value={profile.currentCompensation ?? ""}
              onChange={(event) =>
                patch({ currentCompensation: event.target.value })
              }
            />
          </label>
          <label className="space-y-1 text-sm sm:col-span-2">
            <span className="text-muted-foreground">Expected CTC text</span>
            <Input
              value={profile.targetCompensation ?? ""}
              onChange={(event) =>
                patch({ targetCompensation: event.target.value })
              }
            />
          </label>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Which jobs to find</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Type normal words — one per line. Most people only change the boxes
            below. You do not need regex.
          </p>
          <label className="block space-y-1 text-sm">
            <span className="text-muted-foreground">
              Places you can work (city / country words)
            </span>
            <textarea
              className="min-h-20 w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm"
              value={patternsToWords(profile.discovery.homeLocationPatterns)}
              onChange={(event) =>
                patchDiscovery({
                  homeLocationPatterns: wordsToPatterns(event.target.value),
                })
              }
              placeholder={"bangalore\nindia"}
            />
          </label>
          <label className="block space-y-1 text-sm">
            <span className="text-muted-foreground">
              Job titles you want (exact-ish words from the title)
            </span>
            <textarea
              className="min-h-24 w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm"
              value={patternsToWords(profile.discovery.titleHardPatterns)}
              onChange={(event) =>
                patchDiscovery({
                  titleHardPatterns: wordsToPatterns(event.target.value),
                })
              }
              placeholder={"nurse\nteacher\nproduct designer"}
            />
          </label>
          <label className="block space-y-1 text-sm">
            <span className="text-muted-foreground">
              Also accept these titles (optional)
            </span>
            <textarea
              className="min-h-20 w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm"
              value={patternsToWords(profile.discovery.titleSoftPatterns)}
              onChange={(event) =>
                patchDiscovery({
                  titleSoftPatterns: wordsToPatterns(event.target.value),
                })
              }
              placeholder={"coordinator\nspecialist"}
            />
          </label>
          <label className="block space-y-1 text-sm">
            <span className="text-muted-foreground">
              Words that should appear in the job post (optional)
            </span>
            <textarea
              className="min-h-20 w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm"
              value={patternsToWords(profile.discovery.jdSignalPatterns)}
              onChange={(event) =>
                patchDiscovery({
                  jdSignalPatterns: wordsToPatterns(event.target.value),
                })
              }
              placeholder={"hospital\nclassroom\nfigma"}
            />
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={profile.discovery.openTitleMatching}
              onChange={(event) =>
                patchDiscovery({ openTitleMatching: event.target.checked })
              }
              className="size-3.5 accent-foreground"
            />
            Show almost any job title (best for non-tech careers)
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={profile.discovery.requireJdSignalsForSoftTitles}
              onChange={(event) =>
                patchDiscovery({
                  requireJdSignalsForSoftTitles: event.target.checked,
                })
              }
              className="size-3.5 accent-foreground"
            />
            Soft titles must also match a job-post word above
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={profile.discovery.openRemoteOk}
              onChange={(event) =>
                patchDiscovery({ openRemoteOk: event.target.checked })
              }
              className="size-3.5 accent-foreground"
            />
            Keep open-remote / work-from-anywhere roles
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={profile.discovery.excludeAbroadResidency}
              onChange={(event) =>
                patchDiscovery({
                  excludeAbroadResidency: event.target.checked,
                })
              }
              className="size-3.5 accent-foreground"
            />
            Hide roles that require living in the US / UK / EU only
          </label>

          <button
            type="button"
            className="text-sm font-medium text-foreground underline-offset-4 hover:underline"
            onClick={() => setShowAdvanced((prev) => !prev)}
          >
            {showAdvanced ? "Hide advanced rules" : "Show advanced rules"}
          </button>

          {showAdvanced ? (
            <div className="space-y-3 rounded-xl border border-border bg-muted/30 p-3">
              <p className="text-xs text-muted-foreground">
                Optional. Only if a technical friend needs raw regex or extra
                company boards. Leave this closed for a normal job hunt.
              </p>
              <label className="block space-y-1 text-sm">
                <span className="text-muted-foreground">
                  Home location regexes (one per line)
                </span>
                <textarea
                  className="min-h-20 w-full rounded-lg border border-input bg-transparent px-2.5 py-2 font-mono text-xs"
                  value={lines(profile.discovery.homeLocationPatterns)}
                  onChange={(event) =>
                    patchDiscovery({
                      homeLocationPatterns: splitLines(event.target.value),
                    })
                  }
                />
              </label>
              <label className="block space-y-1 text-sm">
                <span className="text-muted-foreground">
                  Hard title regexes (one per line)
                </span>
                <textarea
                  className="min-h-24 w-full rounded-lg border border-input bg-transparent px-2.5 py-2 font-mono text-xs"
                  value={lines(profile.discovery.titleHardPatterns)}
                  onChange={(event) =>
                    patchDiscovery({
                      titleHardPatterns: splitLines(event.target.value),
                    })
                  }
                />
              </label>
              <label className="block space-y-1 text-sm">
                <span className="text-muted-foreground">
                  Soft title regexes (one per line)
                </span>
                <textarea
                  className="min-h-20 w-full rounded-lg border border-input bg-transparent px-2.5 py-2 font-mono text-xs"
                  value={lines(profile.discovery.titleSoftPatterns)}
                  onChange={(event) =>
                    patchDiscovery({
                      titleSoftPatterns: splitLines(event.target.value),
                    })
                  }
                />
              </label>
              <label className="block space-y-1 text-sm">
                <span className="text-muted-foreground">
                  Job-post signal regexes (one per line)
                </span>
                <textarea
                  className="min-h-20 w-full rounded-lg border border-input bg-transparent px-2.5 py-2 font-mono text-xs"
                  value={lines(profile.discovery.jdSignalPatterns)}
                  onChange={(event) =>
                    patchDiscovery({
                      jdSignalPatterns: splitLines(event.target.value),
                    })
                  }
                />
              </label>
              <label className="block space-y-1 text-sm">
                <span className="text-muted-foreground">
                  Extra company boards —{" "}
                  <code className="text-xs">source:board:Name</code> per line
                </span>
                <textarea
                  className="min-h-24 w-full rounded-lg border border-input bg-transparent px-2.5 py-2 font-mono text-xs"
                  value={portalsText}
                  onChange={(event) => setPortalsText(event.target.value)}
                  placeholder="greenhouse:acme:Acme Corp"
                />
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={profile.discovery.replaceDefaultPortals}
                  onChange={(event) =>
                    patchDiscovery({
                      replaceDefaultPortals: event.target.checked,
                    })
                  }
                  className="size-3.5 accent-foreground"
                />
                Use only my boards (ignore built-in list)
              </label>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={save} disabled={saving}>
          {saving ? "Saving…" : "Save targeting"}
        </Button>
        {message ? (
          <p className="text-sm text-muted-foreground">{message}</p>
        ) : null}
      </div>
    </div>
  );
}
