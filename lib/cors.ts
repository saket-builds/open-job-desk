import { NextResponse } from "next/server";

export function corsHeaders(): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "x-fill-token, content-type",
    "Access-Control-Allow-Methods": "GET, PUT, OPTIONS",
  };
}

export function corsJson(data: unknown, init?: { status?: number }) {
  return NextResponse.json(data, {
    status: init?.status ?? 200,
    headers: corsHeaders(),
  });
}

export function corsEmpty() {
  return new NextResponse(null, { status: 204, headers: corsHeaders() });
}
