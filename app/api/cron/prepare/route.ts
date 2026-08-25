import { NextResponse } from "next/server";
import { authorizeCron } from "@/lib/cron-auth";
import { runAutoPrepare } from "@/lib/pipeline";

export async function GET(request: Request) {
  const denied = authorizeCron(request);
  if (denied) return denied;

  const result = await runAutoPrepare();
  return NextResponse.json(result);
}
