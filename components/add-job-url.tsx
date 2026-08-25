"use client";

import { useState } from "react";
import { Link2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface AddJobUrlProps {
  onAdded: () => void;
}

export function AddJobUrl({ onAdded }: AddJobUrlProps) {
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = url.trim();
    if (!trimmed) return;

    setBusy(true);
    setMessage(null);
    setError(null);

    try {
      const res = await fetch("/api/jobs/import", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url: trimmed }),
      });
      const data = (await res.json()) as {
        error?: string;
        job?: { title?: string; company?: string };
      };

      if (!res.ok) {
        setError(data.error ?? "Could not add that role.");
        return;
      }

      setUrl("");
      setMessage(
        data.job?.title
          ? `Added ${data.job.title} at ${data.job.company ?? "company"}.`
          : "Role added to your desk.",
      );
      onAdded();
    } catch {
      setError("Network error — try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      className="flex w-full max-w-xl flex-col gap-2 sm:flex-row sm:items-start"
    >
      <div className="flex flex-1 flex-col gap-1">
        <Input
          type="url"
          placeholder="Paste Greenhouse, Ashby, or Lever job URL"
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          disabled={busy}
          className="h-9"
        />
        {error ? (
          <p className="text-xs text-destructive">{error}</p>
        ) : message ? (
          <p className="text-xs text-emerald-700">{message}</p>
        ) : (
          <p className="text-xs text-muted-foreground">
            Found a role elsewhere? Add it here — no LinkedIn links.
          </p>
        )}
      </div>
      <Button type="submit" variant="outline" size="sm" disabled={busy || !url.trim()}>
        {busy ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Link2 className="size-4" />
        )}
        Add this job
      </Button>
    </form>
  );
}
