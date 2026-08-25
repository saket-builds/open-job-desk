import { NextResponse } from "next/server";
import { authorizeCron } from "@/lib/cron-auth";
import { runDiscovery } from "@/lib/pipeline";

export const maxDuration = 60;

export async function GET(request: Request) {
  const denied = authorizeCron(request);
  if (denied) return denied;

  const result = await runDiscovery();
  return NextResponse.json(result);
}
