import { NextResponse } from "next/server";
import { initializeLocalStateIfNeeded, runAutoPrepare } from "@/lib/pipeline";

export async function POST() {
  await initializeLocalStateIfNeeded();
  const result = await runAutoPrepare();
  return NextResponse.json(result);
}
