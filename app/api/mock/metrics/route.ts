import { NextResponse } from "next/server";
import { MOCK_API_SAMPLE } from "@/lib/data";

export const dynamic = "force-dynamic";

/**
 * Demo endpoint for the REST connector. Returns a JSON array of metric rows so
 * users can try the connector without wiring up a real API.
 */
export function GET() {
  return NextResponse.json(MOCK_API_SAMPLE, {
    headers: { "Cache-Control": "no-store" },
  });
}
