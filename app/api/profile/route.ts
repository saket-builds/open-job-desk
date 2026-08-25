import { NextResponse } from "next/server";
import { getPacketAndToken } from "@/lib/packet-service";
import { getApplicationAnswers, getProfileCheck, getProfileSummary, getResumeInfo } from "@/lib/profile-service";

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
