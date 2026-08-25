"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Check,
  Clock,
  ExternalLink,
  Loader2,
  Send,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  appliedDateLabel,
  boardLanes,
  daysSince,
  followUpDue,
  FOLLOW_UP_DAYS,
  outcomeLabel,
} from "@/lib/board";
import type { MustHave, OutcomeStatus, PipelineJob } from "@/lib/types";
import { FindNewJobsButton } from "@/components/find-new-jobs-button";
import { AddJobUrl } from "@/components/add-job-url";
import { cn } from "@/lib/utils";

const GENERIC_KNOCKOUTS = [
  "Canonical resume PDF must be attached on the employer form",
] as const;

function isGenericKnockoutText(text: string): boolean {
  if ((GENERIC_KNOCKOUTS as readonly string[]).includes(text)) return true;
  return /^Confirm this remote role hires people in /i.test(text);
}

const SKILL_PILL_LIMIT = 10;

function isGenericKnockout(text: string): boolean {
  return isGenericKnockoutText(text);
}

function jobSpecificKnockouts(job: PipelineJob): string[] {
  return (job.knockouts ?? job.blockers ?? []).filter(
    (item) => !isGenericKnockout(item),
  );
}

export function ApprovalsPageClient() {
  const [jobs, setJobs] = useState<PipelineJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);
  const [lane, setLane] = useState<"to-review" | "applying" | "history">(
    "to-review",
  );
  const [laneReady, setLaneReady] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/pipeline?status=all");
    const data = (await res.json()) as { jobs: PipelineJob[] };
    setJobs(data.jobs);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const { toReview, applyingNow, history } = useMemo(
    () => boardLanes(jobs),
    [jobs],
  );

  useEffect(() => {
    if (loading || laneReady) return;
    if (toReview.length === 0 && applyingNow.length > 0) {
      setLane("applying");
    } else if (
      toReview.length === 0 &&
      applyingNow.length === 0 &&
      history.length > 0
    ) {
      setLane("history");
    }
    setLaneReady(true);
  }, [loading, laneReady, toReview.length, applyingNow.length, history.length]);

  async function decide(
    id: string,
    action: "approve" | "reject",
    reason?: string,
  ) {
    setBusyId(id);
    setError(null);
    try {
      const res = await fetch(`/api/approve/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          reason,
        }),
      });
      if (!res.ok) {
        const body = (await res.json()) as { error?: string };
        throw new Error(body.error ?? "Could not save your choice");
      }
      const job = jobs.find((item) => item.id === id);
      if (action === "approve" && job) {
        setDone(
          `Approved ${job.company}. It moved to Applying now — open the posting when you are ready.`,
        );
        setLane("applying");
      }
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save your choice");
    } finally {
      setBusyId(null);
    }
  }

  async function markSubmitted(id: string) {
    setBusyId(id);
    setError(null);
    try {
      const res = await fetch(`/api/jobs/${id}/submit`, { method: "POST" });
      if (!res.ok) {
        const body = (await res.json()) as { error?: string };
        throw new Error(body.error ?? "Could not record submission");
      }
      const job = jobs.find((item) => item.id === id);
      setDone(
        job
          ? `Recorded ${job.company}. It is in History with today's date.`
          : "Recorded. It is in History.",
      );
      setLane("history");
      await load();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not record submission",
      );
    } finally {
      setBusyId(null);
    }
  }

  async function setOutcome(id: string, status: OutcomeStatus) {
    setBusyId(id);
    setError(null);
    try {
      const res = await fetch(`/api/jobs/${id}/outcome`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const body = (await res.json()) as { error?: string };
        throw new Error(body.error ?? "Could not update status");
      }
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update status");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-border px-6 py-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Jobs for you</h1>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              Review new roles, apply on the company site, then keep the outcome
              here. Nothing is sent until you click Submit yourself. New roles
              also arrive automatically around 11:30 AM — or tap Find new jobs
              anytime.
            </p>
          </div>
          <FindNewJobsButton onScanned={load} />
        </div>
        <div className="mt-4">
          <AddJobUrl onAdded={load} />
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-6 p-6">
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        {done ? (
          <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
            {done}
          </p>
        ) : null}

        {loading ? (
          <p className="text-sm text-muted-foreground">Loading roles…</p>
        ) : (
          <>
            <div
              role="tablist"
              aria-label="Job stages"
              className="flex flex-wrap gap-2 border-b border-border pb-3"
            >
              {(
                [
                  {
                    id: "to-review" as const,
                    label: "To review",
                    count: toReview.length,
                  },
                  {
                    id: "applying" as const,
                    label: "Applying now",
                    count: applyingNow.length,
                  },
                  {
                    id: "history" as const,
                    label: "History",
                    count: history.length,
                  },
                ] as const
              ).map((tab) => {
                const active = lane === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setLane(tab.id)}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      active
                        ? "bg-foreground text-background"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    {tab.label}
                    <span
                      className={cn(
                        "rounded-full px-1.5 py-0.5 text-xs tabular-nums",
                        active
                          ? "bg-background/15 text-background"
                          : "bg-muted text-muted-foreground",
                      )}
                    >
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {lane === "to-review" || lane === "applying" ? (
              <ToReviewTips />
            ) : null}

            {lane === "to-review" ? (
              <LanePanel
                empty="No new roles waiting. Tap Find new jobs above, or check back after the daily search around 11:30 AM."
                count={toReview.length}
              >
                {toReview.map((job) => (
                  <ReviewCard
                    key={job.id}
                    job={job}
                    busy={busyId === job.id}
                    onApprove={() => decide(job.id, "approve")}
                    onSkip={() => decide(job.id, "reject", "Not a fit")}
                  />
                ))}
              </LanePanel>
            ) : null}

            {lane === "applying" ? (
              <LanePanel
                empty="Nothing in progress. Approve a role in To review, then apply on the company site."
                count={applyingNow.length}
              >
                {applyingNow.map((job) => (
                  <ApplyingCard
                    key={job.id}
                    job={job}
                    busy={busyId === job.id}
                    onSubmitted={() => markSubmitted(job.id)}
                  />
                ))}
              </LanePanel>
            ) : null}

            {lane === "history" ? (
              <LanePanel
                empty="No submissions yet. After you apply, tap I submitted in Applying now."
                count={history.length}
              >
                {history.map((job) => (
                  <HistoryCard
                    key={job.id}
                    job={job}
                    busy={busyId === job.id}
                    onOutcome={(status) => setOutcome(job.id, status)}
                  />
                ))}
              </LanePanel>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}

function LanePanel({
  count,
  empty,
  children,
}: {
  count: number;
  empty: string;
  children: ReactNode;
}) {
  if (count === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border p-8 text-sm text-muted-foreground">
        {empty}
      </div>
    );
  }

  return <div className="grid gap-4">{children}</div>;
}

function ToReviewTips() {
  return (
    <div className="rounded-xl border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
      <p className="font-medium text-foreground">Before you apply</p>
      <ul className="mt-2 list-disc space-y-1 pl-5">
        <li>Canonical resume PDF must be attached on the employer form</li>
        <li>
          Confirm remote roles hire in your target locations before you apply
        </li>
        <li>
          If you approve, the job moves to <strong>Applying now</strong>. You
          still submit on the company site yourself.
        </li>
      </ul>
      <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-emerald-600" aria-hidden />
          Green = on your résumé
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span
            className="size-2.5 rounded-full border border-amber-600/50 bg-amber-100"
            aria-hidden
          />
          Amber = in the JD, confirm before claiming
        </span>
      </p>
    </div>
  );
}

function JobMeta({ job }: { job: PipelineJob }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <CardTitle className="text-lg">{job.title}</CardTitle>
        <p className="text-sm text-muted-foreground">
          {job.company}
          {job.locations?.length ? ` · ${job.locations.join(", ")}` : ""}
          {job.workMode ? ` · ${job.workMode}` : ""}
        </p>
      </div>
      <Badge variant="outline">Fit {job.score}</Badge>
    </div>
  );
}

function MatchSummary({ job }: { job: PipelineJob }) {
  const skills = job.mustHaves ?? [];
  const shown = skills.slice(0, SKILL_PILL_LIMIT);
  const extra = skills.length - shown.length;

  return (
    <div className="space-y-2">
      {typeof job.experienceMin === "number" ? (
        <p className="text-sm text-muted-foreground">
          Asks ~{job.experienceMin}+ years
        </p>
      ) : null}
      {shown.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {shown.map((item) => (
            <SkillPill key={item.requirement} item={item} />
          ))}
          {extra > 0 ? (
            <Badge variant="outline" className="text-muted-foreground">
              +{extra} more
            </Badge>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function SkillPill({ item }: { item: MustHave }) {
  const hasSkill = item.status === "met";
  return (
    <Badge
      variant="outline"
      className={cn(
        hasSkill
          ? "border-emerald-200 bg-emerald-50 text-emerald-900"
          : "border-amber-200 bg-amber-50 text-amber-950",
      )}
    >
      {item.requirement}
    </Badge>
  );
}

function Knockouts({ items }: { items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div>
      <p className="mb-1 text-sm font-medium">Check before you apply</p>
      <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function ReviewCard({
  job,
  busy,
  onApprove,
  onSkip,
}: {
  job: PipelineJob;
  busy: boolean;
  onApprove: () => void;
  onSkip: () => void;
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <JobMeta job={job} />
      </CardHeader>
      <CardContent className="space-y-4">
        <MatchSummary job={job} />
        <Knockouts items={jobSpecificKnockouts(job)} />
        <div className="flex flex-wrap gap-2">
          <Button onClick={onApprove} disabled={busy}>
            {busy ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Check className="size-4" />
            )}
            Yes, I want to apply
          </Button>
          <Button variant="outline" onClick={onSkip} disabled={busy}>
            <X className="size-4" />
            Skip this one
          </Button>
          <PostingLink href={job.url} />
        </div>
      </CardContent>
    </Card>
  );
}

function ApplyingCard({
  job,
  busy,
  onSubmitted,
}: {
  job: PipelineJob;
  busy: boolean;
  onSubmitted: () => void;
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <JobMeta job={job} />
      </CardHeader>
      <CardContent className="space-y-4">
        <MatchSummary job={job} />
        <Knockouts items={jobSpecificKnockouts(job)} />
        <p className="text-sm text-muted-foreground">
          Open the posting. In Chrome, tap <strong>Fill from résumé</strong> on
          the dark bar. Attach your résumé PDF, check the form, then click
          Submit yourself. Come back here and tap I submitted.
        </p>
        <div className="flex flex-wrap gap-2">
          <a
            href={job.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/80"
          >
            Open posting
            <ExternalLink className="size-3.5" />
          </a>
          <Button variant="outline" onClick={onSubmitted} disabled={busy}>
            {busy ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Send className="size-4" />
            )}
            I submitted
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function HistoryCard({
  job,
  busy,
  onOutcome,
}: {
  job: PipelineJob;
  busy: boolean;
  onOutcome: (status: OutcomeStatus) => void;
}) {
  const outcome = job.outcomeStatus ?? "applied";
  const appliedOn = appliedDateLabel(job.submittedAt);
  const days = daysSince(job.submittedAt);
  const nudge = followUpDue(job);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="text-lg">{job.title}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {job.company}
              {appliedOn ? ` · Applied ${appliedOn}` : ""}
              {days != null ? ` · ${days}d ago` : ""}
            </p>
          </div>
          <Badge variant={outcome === "closed" ? "secondary" : "outline"}>
            {outcomeLabel(outcome)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {nudge ? (
          <p className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
            <Clock className="mt-0.5 size-4 shrink-0" />
            No reply yet — {FOLLOW_UP_DAYS} days since you applied. Follow up
            if you want.
          </p>
        ) : null}
        <div className="flex flex-wrap gap-2">
          {(["interview", "offer", "closed"] as const).map((status) => (
            <Button
              key={status}
              size="sm"
              variant={outcome === status ? "default" : "outline"}
              disabled={busy}
              onClick={() => onOutcome(status)}
            >
              {busy && outcome !== status ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : null}
              {outcomeLabel(status)}
            </Button>
          ))}
          <PostingLink href={job.url} />
        </div>
      </CardContent>
    </Card>
  );
}

function PostingLink({ href }: { href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border px-3 text-sm hover:bg-muted"
    >
      View job
      <ExternalLink className="size-3.5" />
    </a>
  );
}
