"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CopyField } from "@/components/copy-field";
import type { ApplicationPacket, EducationEntry, WorkRole } from "@/lib/types";

interface PacketEditorProps {
  initial: ApplicationPacket;
  fillToken: string;
  onSaved?: (packet: ApplicationPacket, fillToken: string) => void;
}

export function PacketEditor({
  initial,
  fillToken,
  onSaved,
}: PacketEditorProps) {
  const [packet, setPacket] = useState(initial);
  const [token, setToken] = useState(fillToken);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  function patch(partial: Partial<ApplicationPacket>) {
    setPacket((prev) => ({ ...prev, ...partial }));
  }

  async function save() {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/packet", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packet }),
      });
      const body = (await res.json()) as {
        packet?: ApplicationPacket;
        fillToken?: string;
        error?: string;
      };
      if (!res.ok) throw new Error(body.error ?? "Save failed");
      if (body.packet) setPacket(body.packet);
      if (body.fillToken) setToken(body.fillToken);
      setMessage("Saved. The fill helper will use this on Greenhouse forms.");
      if (body.packet && body.fillToken) onSaved?.(body.packet, body.fillToken);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function rotateToken() {
    setSaving(true);
    try {
      const res = await fetch("/api/packet", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rotateToken: true }),
      });
      const body = (await res.json()) as { fillToken?: string; error?: string };
      if (!res.ok) throw new Error(body.error ?? "Could not rotate token");
      if (body.fillToken) {
        setToken(body.fillToken);
        setMessage("New fill token created. Paste it into the Chrome helper.");
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not rotate token");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Fill helper (Chrome)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <ol className="list-decimal space-y-1 pl-5 text-muted-foreground">
            <li>
              Download{" "}
              <a
                className="underline"
                href="/job-desk-fill-helper.zip"
              >
                job-desk-fill-helper.zip
              </a>
            </li>
            <li>Unzip, then Chrome → Extensions → Developer mode → Load unpacked</li>
            <li>Paste the token below into the helper popup and Save</li>
            <li>
              Open a Greenhouse posting → tap <strong>Fill from résumé</strong>{" "}
              → attach PDF → you click Submit
            </li>
          </ol>
          <CopyField label="Fill token" value={token} mono />
          <Button variant="outline" onClick={() => void rotateToken()} disabled={saving}>
            Make a new token
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Application packet</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Facts the helper types into forms. Confirm once against the résumé.
            Custom questions stay blank on purpose.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field
              label="Full name"
              value={packet.fullName}
              onChange={(fullName) => {
                const parts = fullName.trim().split(/\s+/);
                patch({
                  fullName,
                  firstName: parts[0] || packet.firstName,
                  lastName: parts.slice(1).join(" ") || packet.lastName,
                });
              }}
            />
            <Field
              label="Email"
              value={packet.email}
              onChange={(email) => patch({ email })}
            />
            <Field
              label="Phone"
              value={packet.phone}
              onChange={(phone) => patch({ phone })}
            />
            <Field
              label="Location"
              value={packet.location}
              onChange={(location) => patch({ location })}
            />
            <Field
              label="City"
              value={packet.city}
              onChange={(city) => patch({ city })}
            />
            <Field
              label="Country"
              value={packet.country}
              onChange={(country) => patch({ country })}
            />
            <Field
              label="LinkedIn"
              value={packet.linkedin}
              onChange={(linkedin) => patch({ linkedin })}
            />
            <Field
              label="GitHub"
              value={packet.github}
              onChange={(github) => patch({ github })}
            />
            <Field
              label="Website"
              value={packet.website}
              onChange={(website) => patch({ website })}
            />
            <Field
              label="Availability"
              value={packet.availability}
              onChange={(availability) => patch({ availability })}
            />
            <Field
              label="Years of experience"
              value={String(packet.yearsExperience)}
              onChange={(value) =>
                patch({ yearsExperience: Number(value) || 0 })
              }
            />
            <Field
              label="Product-based org?"
              value={packet.productBased}
              onChange={(productBased) => patch({ productBased })}
            />
          </div>
          <Field
            label="Work authorization"
            value={packet.workAuthorization}
            onChange={(workAuthorization) => patch({ workAuthorization })}
          />
          <Field
            label="Current CTC (when asked)"
            value={packet.currentCtc}
            onChange={(currentCtc) => patch({ currentCtc })}
          />
          <Field
            label="Expected CTC (when asked)"
            value={packet.expectedCtc}
            onChange={(expectedCtc) => patch({ expectedCtc })}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Work history</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setPacket((prev) => ({
                ...prev,
                roles: [
                  ...prev.roles,
                  {
                    company: "",
                    title: "",
                    start: "",
                    location: "Bangalore, India",
                    current: false,
                  },
                ],
              }))
            }
          >
            Add role
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {packet.roles.map((role, index) => (
            <RoleFields
              key={`${role.company}-${index}`}
              role={role}
              onChange={(next) =>
                setPacket((prev) => ({
                  ...prev,
                  roles: prev.roles.map((item, i) => (i === index ? next : item)),
                }))
              }
              onRemove={() =>
                setPacket((prev) => ({
                  ...prev,
                  roles: prev.roles.filter((_, i) => i !== index),
                }))
              }
            />
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Education</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setPacket((prev) => ({
                ...prev,
                education: [
                  ...prev.education,
                  { school: "", degree: "", field: "" },
                ],
              }))
            }
          >
            Add school
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {packet.education.map((entry, index) => (
            <EducationFields
              key={`${entry.school}-${index}`}
              entry={entry}
              onChange={(next) =>
                setPacket((prev) => ({
                  ...prev,
                  education: prev.education.map((item, i) =>
                    i === index ? next : item,
                  ),
                }))
              }
              onRemove={() =>
                setPacket((prev) => ({
                  ...prev,
                  education: prev.education.filter((_, i) => i !== index),
                }))
              }
            />
          ))}
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={() => void save()} disabled={saving}>
          {saving ? "Saving…" : "Save packet"}
        </Button>
        {message ? (
          <p className="text-sm text-muted-foreground">{message}</p>
        ) : null}
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-1 text-sm">
      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <Input value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function RoleFields({
  role,
  onChange,
  onRemove,
}: {
  role: WorkRole;
  onChange: (role: WorkRole) => void;
  onRemove: () => void;
}) {
  return (
    <div className="space-y-3 rounded-lg border border-border p-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field
          label="Company"
          value={role.company}
          onChange={(company) => onChange({ ...role, company })}
        />
        <Field
          label="Title"
          value={role.title}
          onChange={(title) => onChange({ ...role, title })}
        />
        <Field
          label="Start (YYYY-MM)"
          value={role.start}
          onChange={(start) => onChange({ ...role, start })}
        />
        <Field
          label="End (YYYY-MM)"
          value={role.end ?? ""}
          onChange={(end) => onChange({ ...role, end })}
        />
        <Field
          label="Location"
          value={role.location}
          onChange={(location) => onChange({ ...role, location })}
        />
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={role.current}
            onChange={(event) =>
              onChange({ ...role, current: event.target.checked })
            }
          />
          Current role
        </label>
      </div>
      <Field
        label="Short summary"
        value={role.summary ?? ""}
        onChange={(summary) => onChange({ ...role, summary })}
      />
      <Button variant="ghost" size="sm" onClick={onRemove}>
        Remove role
      </Button>
    </div>
  );
}

function EducationFields({
  entry,
  onChange,
  onRemove,
}: {
  entry: EducationEntry;
  onChange: (entry: EducationEntry) => void;
  onRemove: () => void;
}) {
  return (
    <div className="space-y-3 rounded-lg border border-border p-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field
          label="School"
          value={entry.school}
          onChange={(school) => onChange({ ...entry, school })}
        />
        <Field
          label="Degree"
          value={entry.degree}
          onChange={(degree) => onChange({ ...entry, degree })}
        />
        <Field
          label="Field"
          value={entry.field}
          onChange={(field) => onChange({ ...entry, field })}
        />
        <Field
          label="Years"
          value={[entry.start, entry.end].filter(Boolean).join(" – ")}
          onChange={(value) => {
            const [start, end] = value.split(/[–-]/).map((part) => part.trim());
            onChange({ ...entry, start, end });
          }}
        />
      </div>
      <Button variant="ghost" size="sm" onClick={onRemove}>
        Remove school
      </Button>
    </div>
  );
}
