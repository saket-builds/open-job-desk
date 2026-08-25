import { NextResponse } from "next/server";
import { importJobFromUrl } from "@/lib/pipeline";

export async function POST(request: Request) {
  const body = (await request.json()) as { url?: string; force?: boolean };
  const url = body.url?.trim();
  if (!url) {
    return NextResponse.json({ error: "Paste a job URL first." }, { status: 400 });
  }

  const result = await importJobFromUrl(url, { force: Boolean(body.force) });
  if (!result.added) {
    return NextResponse.json(
      { error: result.reason ?? "Could not add that role.", job: result.job },
      { status: result.job ? 409 : 422 },
    );
  }

  return NextResponse.json(result);
}
