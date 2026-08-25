"use client";

import { useEffect, useState } from "react";
import { ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { LedgerEntry, LedgerReview } from "@/lib/types";

interface LedgerResponse {
  entries: LedgerEntry[];
  review: LedgerReview;
}

export function LedgerPageClient() {
  const [data, setData] = useState<LedgerResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/ledger")
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to load ledger");
        return res.json() as Promise<LedgerResponse>;
      })
      .then(setData)
      .catch((err: Error) => setError(err.message));
  }, []);

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-border px-6 py-6">
        <h1 className="text-2xl font-semibold tracking-tight">Ledger</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Confirmed submissions only — recorded after a visible success page.
        </p>
      </header>

      <div className="flex flex-1 flex-col gap-6 p-6">
        {error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : !data ? (
          <p className="text-sm text-muted-foreground">Loading ledger…</p>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-4">
              <div className="rounded-xl border border-border p-4">
                <p className="text-sm text-muted-foreground">Submitted</p>
                <p className="font-mono text-2xl font-semibold">
                  {data.review.uniqueSubmittedTotal}
                </p>
              </div>
              <div className="rounded-xl border border-border p-4">
                <p className="text-sm text-muted-foreground">Interviews</p>
                <p className="font-mono text-2xl font-semibold">
                  {data.review.outcomeCounts.interview}
                </p>
              </div>
              <div className="rounded-xl border border-border p-4">
                <p className="text-sm text-muted-foreground">Offers</p>
                <p className="font-mono text-2xl font-semibold">
                  {data.review.outcomeCounts.offer}
                </p>
              </div>
              <div className="rounded-xl border border-border p-4">
                <p className="text-sm text-muted-foreground">Rejected</p>
                <p className="font-mono text-2xl font-semibold">
                  {data.review.outcomeCounts.rejected}
                </p>
              </div>
            </div>

            {data.entries.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border p-10 text-center">
                <p className="text-sm text-muted-foreground">
                  No confirmed submissions yet.
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {data.review.nextStep}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Role</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Approval</TableHead>
                      <TableHead />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.entries.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell className="font-medium">
                          {entry.role}
                        </TableCell>
                        <TableCell>{entry.company}</TableCell>
                        <TableCell className="font-mono">
                          {entry.score}
                        </TableCell>
                        <TableCell>
                          {new Date(entry.submittedAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{entry.approval}</Badge>
                        </TableCell>
                        <TableCell>
                          <a
                            href={entry.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={buttonVariants({
                              variant: "ghost",
                              size: "icon-sm",
                            })}
                          >
                            <ExternalLink className="size-4" />
                          </a>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
