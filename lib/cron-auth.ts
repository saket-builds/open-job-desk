import { NextResponse } from "next/server";

/**
 * Protect cron routes. On Vercel / NODE_ENV=production, CRON_SECRET is required.
 * Locally, missing secret still allows the route (dev convenience).
 */
export function authorizeCron(request: Request): NextResponse | null {
  const secret = process.env.CRON_SECRET?.trim();
  const auth = request.headers.get("authorization");
  const isHosted =
    Boolean(process.env.VERCEL) || process.env.NODE_ENV === "production";

  if (!secret) {
    if (isHosted) {
      return NextResponse.json(
        { error: "CRON_SECRET must be set in production" },
        { status: 401 },
      );
    }
    return null;
  }

  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return null;
}
