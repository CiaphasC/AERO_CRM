import { NextResponse } from "next/server";

const cacheHeaders = {
  "cache-control": "public, s-maxage=600, stale-while-revalidate=600",
};

const slugs = ["home", "journey", "bpmn", "arquitectura", "calendario"] as const;

type AvailableSlug = (typeof slugs)[number];

export type ContentIndexResponse = {
  available: AvailableSlug[];
};

export async function GET() {
  const body: ContentIndexResponse = { available: [...slugs] };
  return NextResponse.json(body, { headers: cacheHeaders });
}
