import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { DeskStatus, PipelineJob } from "@/lib/types";
import { cn } from "@/lib/utils";

const statusStyles: Record<string, string> = {
  "pending-approval": "border-violet-200 bg-violet-50 text-violet-900",
  approved: "border-emerald-200 bg-emerald-50 text-emerald-800",
  ready: "border-emerald-200 bg-emerald-50 text-emerald-800",
  "needs-you": "border-amber-200 bg-amber-50 text-amber-900",
  applied: "border-sky-200 bg-sky-50 text-sky-900",
  skipped: "border-border bg-muted text-muted-foreground",
  rejected: "border-rose-200 bg-rose-50 text-rose-900",
  scored: "border-border bg-muted text-muted-foreground",
};

const statusLabels: Record<string, string> = {
  "pending-approval": "Pending approval",
  approved: "Approved",
  ready: "Ready",
  "needs-you": "Needs you",
  applied: "Applied",
  skipped: "Skipped",
  rejected: "Declined",
  scored: "Scored",
};

interface PipelineTableProps {
  jobs: PipelineJob[];
  onSelect: (job: PipelineJob) => void;
  selectedId?: string;
}

export function PipelineTable({ jobs, onSelect, selectedId }: PipelineTableProps) {
  if (jobs.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
        No jobs match this filter.
      </div>
    );
  }

  return (
    <>
      <div className="hidden overflow-x-auto rounded-xl border border-border md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Role</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>Mode</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Note</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {jobs.map((job) => (
              <TableRow
                key={job.id}
                className={cn(
                  "cursor-pointer transition-colors duration-200 hover:bg-muted/50",
                  selectedId === job.id && "bg-muted/70",
                )}
                onClick={() => onSelect(job)}
              >
                <TableCell className="font-medium">{job.title}</TableCell>
                <TableCell>{job.company}</TableCell>
                <TableCell className="font-mono">{job.score}</TableCell>
                <TableCell className="capitalize">{job.workMode}</TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={statusStyles[job.deskStatus]}
                  >
                    {statusLabels[job.deskStatus] ?? job.deskStatus}
                  </Badge>
                </TableCell>
                <TableCell className="max-w-xs truncate text-muted-foreground">
                  {job.pauseReason ?? job.blockers?.[0] ?? "—"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="grid gap-3 md:hidden">
        {jobs.map((job) => (
          <button
            key={job.id}
            type="button"
            onClick={() => onSelect(job)}
            className={cn(
              "rounded-xl border border-border bg-card p-4 text-left transition-colors duration-200 hover:bg-muted/40",
              selectedId === job.id && "ring-2 ring-primary/30",
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium">{job.title}</p>
                <p className="text-sm text-muted-foreground">{job.company}</p>
              </div>
              <span className="font-mono text-lg font-semibold">{job.score}</span>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Badge
                variant="outline"
                className={statusStyles[job.deskStatus]}
              >
                {statusLabels[job.deskStatus] ?? job.deskStatus}
              </Badge>
              <span className="text-xs capitalize text-muted-foreground">
                {job.workMode}
              </span>
            </div>
          </button>
        ))}
      </div>
    </>
  );
}
