"use client";

import { useEffect, useState, type RefObject } from "react";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  FileText,
  Loader2,
} from "lucide-react";
import { CopyField } from "@/components/copy-field";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { PipelineJob } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ApplyDrawerProps {
  job: PipelineJob | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmitted: () => void;
  /** Element to focus when the fullscreen closes (keeps you on All jobs). */
  returnFocusRef?: RefObject<HTMLElement | null>;
}

interface ProfilePayload {
  profile: {
    name: string;
    submissionMode: string;
  };
  resume: { path: string };
  answers: Record<string, string>;
}

const checklistItems = [
  "You have approved this role",
  "Run local fill (or attach the canonical résumé PDF yourself)",
  "Paste CTC answers if the form asks for salary",
  "YOU click Submit on the employer site — the desk never does",
  "Return here and mark as submitted only after a thank-you page",
];

function OpenPostingButton({
  url,
  className,
  size = "default",
  variant = "default",
}: {
  url: string;
  className?: string;
  size?: "default" | "lg";
  variant?: "default" | "outline";
}) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={buttonVariants({
        variant,
        size,
        className: cn("w-full sm:w-auto", className),
      })}
    >
      Open job posting
      <ExternalLink className="size-4" />
    </a>
  );
}

export function ApplyDrawer({
  job,
  open,
  onOpenChange,
  onSubmitted,
  returnFocusRef,
}: ApplyDrawerProps) {
  const [profileData, setProfileData] = useState<ProfilePayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checked, setChecked] = useState<boolean[]>(
    checklistItems.map(() => false),
  );

  useEffect(() => {
    if (!open) {
      setChecked(checklistItems.map(() => false));
      setError(null);
      return;
    }

    setLoading(true);
    fetch("/api/profile")
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to load profile");
        return res.json() as Promise<ProfilePayload>;
      })
      .then(setProfileData)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [open]);

  const allChecked = checked.every(Boolean);

  const canApply =
    job?.deskStatus === "approved" ||
    job?.deskStatus === "needs-you" ||
    job?.deskStatus === "ready";
  const awaitingApproval = job?.deskStatus === "pending-approval";

  async function markSubmitted() {
    if (!job || !allChecked || !canApply) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/jobs/${job.id}/submit`, {
        method: "POST",
      });

      if (!res.ok) {
        const body = (await res.json()) as { error?: string };
        throw new Error(body.error ?? "Failed to record submission");
      }

      onSubmitted();
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setSubmitting(false);
    }
  }

  async function skipJob() {
    if (!job) return;
    await fetch(`/api/pipeline/${job.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ deskStatus: "skipped" }),
    });
    onSubmitted();
    onOpenChange(false);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        fullScreen
        finalFocus={returnFocusRef ?? false}
        className="flex h-full w-full flex-col gap-0 overflow-hidden p-0"
      >
        {job ? (
          <>
            <SheetHeader className="shrink-0 border-b border-border px-6 py-5 pr-14 sm:px-10">
              <div className="mx-auto w-full max-w-6xl space-y-3">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="-ml-2 w-fit gap-1.5 text-muted-foreground"
                  onClick={() => onOpenChange(false)}
                >
                  <ArrowLeft className="size-4" />
                  Back to all jobs
                </Button>
                <div className="space-y-1">
                  <SheetTitle className="break-words text-xl sm:text-2xl">
                    {job.title}
                  </SheetTitle>
                  <SheetDescription className="break-words text-base">
                    {job.company} · {job.workMode} · score{" "}
                    <span className="font-mono">{job.score}</span>
                  </SheetDescription>
                </div>
              </div>
            </SheetHeader>

            {canApply ? (
              <div className="shrink-0 border-b border-border bg-emerald-50/60 px-6 py-4 sm:px-10">
                <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm leading-relaxed text-emerald-950 sm:max-w-2xl">
                    You approved this role. Open the posting, tap{" "}
                    <strong>Fill from résumé</strong> in Chrome, attach your PDF,
                    then click Submit on the company site.
                  </p>
                  <OpenPostingButton url={job.url} size="lg" />
                </div>
              </div>
            ) : null}

            {awaitingApproval ? (
              <div className="shrink-0 border-b border-border px-6 py-4 sm:px-10">
                <div className="mx-auto w-full max-w-6xl">
                  <OpenPostingButton url={job.url} variant="outline" />
                </div>
              </div>
            ) : null}

            <ScrollArea className="min-h-0 flex-1">
              <div className="mx-auto grid w-full max-w-6xl gap-8 px-6 py-6 sm:px-10 lg:grid-cols-2 lg:gap-10">
                <div className="min-w-0 space-y-6">
                  {awaitingApproval ? (
                    <div className="flex gap-3 rounded-lg border border-violet-200 bg-violet-50 p-4 text-sm text-violet-950">
                      <AlertCircle className="mt-0.5 size-4 shrink-0" />
                      <div className="min-w-0 break-words">
                        <p className="font-medium">Waiting for your approval</p>
                        <p>
                          Say yes on the For you page before applying or marking
                          this as submitted.
                        </p>
                      </div>
                    </div>
                  ) : null}

                  {job.knockouts?.length || job.blockers?.length ? (
                    <section className="space-y-2">
                      <h3 className="text-sm font-semibold">
                        Knock-outs / blockers
                      </h3>
                      <ul className="list-disc space-y-1 pl-5 text-sm break-words text-muted-foreground">
                        {(job.knockouts ?? job.blockers ?? []).map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </section>
                  ) : null}

                  {job.pauseReason ? (
                    <div className="flex gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
                      <AlertCircle className="mt-0.5 size-4 shrink-0" />
                      <div className="min-w-0 break-words">
                        <p className="font-medium">Pause reason</p>
                        <p>{job.pauseReason}</p>
                      </div>
                    </div>
                  ) : null}

                  <section className="space-y-3">
                    <h3 className="text-sm font-semibold">Score gates</h3>
                    <div className="grid gap-2">
                      {job.gates.map((gate) => (
                        <div
                          key={gate.name}
                          className="flex items-start gap-2 rounded-lg border border-border/70 px-3 py-2 text-sm"
                        >
                          <CheckCircle2
                            className={cn(
                              "mt-0.5 size-4 shrink-0",
                              gate.status === "pass"
                                ? "text-emerald-600"
                                : "text-muted-foreground",
                            )}
                          />
                          <div className="min-w-0 break-words">
                            <p className="font-medium capitalize">
                              {gate.name.replace(/-/g, " ")}
                            </p>
                            <p className="text-muted-foreground">
                              {gate.reason}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">
                        Must-haves {job.mustHaveCoverage}%
                      </Badge>
                      <Badge variant="outline">
                        {job.autoEligible ? "Auto-eligible" : "Manual review"}
                      </Badge>
                    </div>
                  </section>

                  <section className="space-y-3">
                    <h3 className="text-sm font-semibold">Must-haves</h3>
                    <div className="space-y-2">
                      {job.mustHaves.map((item) => (
                        <div
                          key={item.requirement}
                          className="rounded-lg border border-border/70 p-3 text-sm"
                        >
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                            <p className="min-w-0 font-medium break-words">
                              {item.requirement}
                            </p>
                            <Badge
                              variant="outline"
                              className="w-fit shrink-0 capitalize"
                            >
                              {item.status}
                            </Badge>
                          </div>
                          <p className="mt-2 break-words text-muted-foreground">
                            {item.evidence}
                          </p>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>

                <div className="min-w-0 space-y-6">
                  {loading ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="size-4 animate-spin" />
                      Loading profile answers…
                    </div>
                  ) : profileData ? (
                    <>
                      <section className="space-y-3">
                        <div className="flex items-center gap-2">
                          <FileText className="size-4" />
                          <h3 className="text-sm font-semibold">Résumé</h3>
                        </div>
                        <CopyField
                          label="Canonical PDF path"
                          value={profileData.resume.path}
                          mono
                        />
                      </section>

                      <section className="space-y-3">
                        <h3 className="text-sm font-semibold">
                          Copyable answers
                        </h3>
                        <div className="space-y-2">
                          {Object.entries(
                            job.preparedAnswers ?? profileData.answers,
                          ).map(([label, value]) => (
                            <CopyField
                              key={label}
                              label={label}
                              value={value}
                            />
                          ))}
                        </div>
                      </section>
                    </>
                  ) : null}

                  <section className="space-y-3">
                    <h3 className="text-sm font-semibold">Apply checklist</h3>
                    <div className="space-y-2">
                      {checklistItems.map((item, index) => (
                        <label
                          key={item}
                          className="flex cursor-pointer items-start gap-3 rounded-lg border border-border/70 p-3 text-sm"
                        >
                          <Checkbox
                            checked={checked[index]}
                            onCheckedChange={(value) =>
                              setChecked((prev) =>
                                prev.map((entry, i) =>
                                  i === index ? value === true : entry,
                                ),
                              )
                            }
                            className="mt-0.5 shrink-0"
                          />
                          <span className="min-w-0 break-words">{item}</span>
                        </label>
                      ))}
                    </div>
                  </section>

                  {error ? (
                    <p className="text-sm text-destructive">{error}</p>
                  ) : null}
                </div>
              </div>
            </ScrollArea>

            <SheetFooter className="shrink-0 gap-3 border-t border-border px-6 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-10">
              <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                {canApply ? <OpenPostingButton url={job.url} /> : <span />}
                <div className="flex gap-2">
                  <Button variant="ghost" onClick={skipJob}>
                    Skip
                  </Button>
                  <Button
                    className="flex-1 sm:flex-none sm:min-w-40"
                    onClick={markSubmitted}
                    disabled={!canApply || !allChecked || submitting}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        Recording…
                      </>
                    ) : (
                      "I submitted"
                    )}
                  </Button>
                </div>
              </div>
            </SheetFooter>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
