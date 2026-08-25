import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { agentStateDir, useBlobStorage } from "@/lib/agent";
import { saveResumeInfo } from "@/lib/profile-service";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Choose a PDF résumé to upload." },
        { status: 400 },
      );
    }
    if (file.type && file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Upload a PDF file." },
        { status: 400 },
      );
    }

    const bytes = Buffer.from(await file.arrayBuffer());
    if (bytes.length === 0) {
      return NextResponse.json({ error: "File is empty." }, { status: 400 });
    }
    if (bytes.length > 8_000_000) {
      return NextResponse.json(
        { error: "PDF must be under 8 MB." },
        { status: 400 },
      );
    }

    const sha256 = createHash("sha256").update(bytes).digest("hex");

    let path: string;
    if (useBlobStorage() || process.env.BLOB_READ_WRITE_TOKEN) {
      const blob = await put(`job-desk/resume-${sha256.slice(0, 12)}.pdf`, bytes, {
        access: "public",
        contentType: "application/pdf",
        addRandomSuffix: false,
        allowOverwrite: true,
      });
      path = blob.url;
    } else {
      const dir = agentStateDir();
      await mkdir(dir, { recursive: true });
      const pdfPath = join(dir, "resume.pdf");
      await writeFile(pdfPath, bytes);
      await writeFile(
        join(dir, "resume.json"),
        `${JSON.stringify({ sha256, bytes: bytes.length }, null, 2)}\n`,
      );
      path = pdfPath;
    }

    const resume = await saveResumeInfo({
      path,
      sha256,
      bytes: bytes.length,
    });

    return NextResponse.json({ resume });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to upload résumé";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
