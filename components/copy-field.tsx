"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CopyFieldProps {
  label: string;
  value: string;
  mono?: boolean;
}

export function CopyField({ label, value, mono }: CopyFieldProps) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    if (!value) return;
    await navigator.clipboard.writeText(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="rounded-lg border border-border/80 bg-muted/30 p-3">
      <div className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div className="flex items-start gap-2">
        <p
          className={cn(
            "min-w-0 flex-1 break-words text-sm",
            mono && "font-mono",
          )}
        >
          {value || "—"}
        </p>
        {value ? (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={copy}
            aria-label={`Copy ${label}`}
          >
            {copied ? (
              <Check className="size-4 text-emerald-600" />
            ) : (
              <Copy className="size-4" />
            )}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
