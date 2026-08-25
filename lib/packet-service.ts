import { randomBytes } from "node:crypto";
import { DEFAULT_PACKET, packetFromProfile, sanitizePacket } from "./packet";
import { getProfileSummary } from "./profile-service";
import { withState } from "./storage";
import type { ApplicationPacket } from "./types";

export async function getPacketAndToken(): Promise<{
  packet: ApplicationPacket;
  fillToken: string;
}> {
  return withState(async (state) => {
    let packet = state.packet;
    if (!packet) {
      try {
        packet = packetFromProfile(await getProfileSummary());
      } catch {
        packet = DEFAULT_PACKET;
      }
      state.packet = packet;
    }
    if (!state.fillToken) {
      state.fillToken = randomBytes(24).toString("hex");
    }
    return {
      state,
      result: { packet, fillToken: state.fillToken },
    };
  });
}

export async function savePacket(
  incoming: Partial<ApplicationPacket>,
): Promise<ApplicationPacket> {
  return withState(async (state) => {
    const current = state.packet ?? DEFAULT_PACKET;
    const packet = sanitizePacket(incoming, current);
    state.packet = packet;
    if (!state.fillToken) {
      state.fillToken = randomBytes(24).toString("hex");
    }
    return { state, result: packet };
  });
}

export async function rotateFillToken(): Promise<string> {
  return withState(async (state) => {
    state.fillToken = randomBytes(24).toString("hex");
    return { state, result: state.fillToken };
  });
}

export async function tokenMatches(request: Request): Promise<boolean> {
  const header = request.headers.get("x-fill-token")?.trim();
  const query = new URL(request.url).searchParams.get("token")?.trim();
  const provided = header || query || "";
  if (!provided) return false;
  const { fillToken } = await getPacketAndToken();
  return provided === fillToken;
}
