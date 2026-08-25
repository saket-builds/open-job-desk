import { NextResponse } from "next/server";
import { runDiscovery } from "@/lib/pipeline";

export const maxDuration = 60;

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET?.trim();
  const auth = request.headers.get("authorization");
  if (secret && auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await runDiscovery();
  return NextResponse.json(result);
}
