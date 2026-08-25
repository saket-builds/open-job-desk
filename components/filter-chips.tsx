"use client";

import { cn } from "@/lib/utils";
import type { DeskStatus } from "@/lib/types";

const filters: { id: DeskStatus | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "pending-approval", label: "Pending approval" },
  { id: "approved", label: "Approved" },
  { id: "applied", label: "Applied" },
  { id: "rejected", label: "Declined" },
];

interface FilterChipsProps {
  value: DeskStatus | "all";
  onChange: (value: DeskStatus | "all") => void;
  counts: Record<string, number>;
}

export function FilterChips({ value, onChange, counts }: FilterChipsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {filters.map((filter) => (
        <button
          key={filter.id}
          type="button"
          onClick={() => onChange(filter.id)}
          className={cn(
            "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors duration-200",
            value === filter.id
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground",
          )}
        >
          {filter.label}
          <span
            className={cn(
              "rounded-full px-1.5 py-0.5 text-xs font-mono",
              value === filter.id
                ? "bg-primary-foreground/15 text-primary-foreground"
                : "bg-muted text-muted-foreground",
            )}
          >
            {counts[filter.id] ?? 0}
          </span>
        </button>
      ))}
    </div>
  );
}
