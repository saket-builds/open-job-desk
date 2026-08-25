import { NextResponse } from "next/server";
import { getPacketAndToken } from "@/lib/packet-service";
import {
  getApplicationAnswers,
  getProfileCheck,
  getProfileSummary,
  getResumeInfo,
  saveProfileSummary,
} from "@/lib/profile-service";
import type { ProfileSummary } from "@/lib/types";

export async function GET() {
  try {
    const [check, profile, resume, packetState] = await Promise.all([
      getProfileCheck(),
      getProfileSummary(),
      getResumeInfo(),
      getPacketAndToken(),
    ]);

    return NextResponse.json({
      check,
      profile,
      resume,
      answers: getApplicationAnswers(profile),
      packet: packetState.packet,
      fillToken: packetState.fillToken,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load profile";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = (await request.json()) as { profile?: Partial<ProfileSummary> };
    if (!body.profile || typeof body.profile !== "object") {
      return NextResponse.json(
        { error: "Send a profile object to save." },
        { status: 400 },
      );
    }
    const profile = await saveProfileSummary(body.profile);
    return NextResponse.json({ profile });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to save profile";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
