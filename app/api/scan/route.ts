import { NextResponse } from "next/server";
import { runDiscovery } from "@/lib/pipeline";

export const maxDuration = 60;

export async function POST() {
  const result = await runDiscovery();
  return NextResponse.json(result);
}
