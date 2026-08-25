import { corsEmpty, corsJson } from "@/lib/cors";
import {
  getPacketAndToken,
  rotateFillToken,
  savePacket,
} from "@/lib/packet-service";
import type { ApplicationPacket } from "@/lib/types";

export async function OPTIONS() {
  return corsEmpty();
}

export async function GET() {
  try {
    const { packet, fillToken } = await getPacketAndToken();
    return corsJson({ packet, fillToken });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load packet";
    return corsJson({ error: message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = (await request.json()) as {
      packet?: Partial<ApplicationPacket>;
      rotateToken?: boolean;
    };
    if (body.rotateToken) {
      const fillToken = await rotateFillToken();
      const { packet } = await getPacketAndToken();
      return corsJson({ packet, fillToken });
    }
    if (!body.packet) {
      return corsJson({ error: "Missing packet" }, { status: 400 });
    }
    const packet = await savePacket(body.packet);
    const { fillToken } = await getPacketAndToken();
    return corsJson({ packet, fillToken });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to save packet";
    return corsJson({ error: message }, { status: 400 });
  }
}
