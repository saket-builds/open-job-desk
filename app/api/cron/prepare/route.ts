import { NextResponse } from "next/server";
import { runAutoPrepare } from "@/lib/pipeline";

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET?.trim();
  const auth = request.headers.get("authorization");
  if (secret && auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await runAutoPrepare();
  return NextResponse.json(result);
}
