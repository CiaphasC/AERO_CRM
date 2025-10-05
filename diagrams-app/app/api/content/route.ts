import { NextResponse } from "next/server";
import { availableContentSlugs, type ContentSlug } from "@/lib/data/content";

const cacheHeaders = {
  "cache-control": "public, s-maxage=600, stale-while-revalidate=600",
};

export type ContentIndexResponse = {
  available: ContentSlug[];
};

export async function GET() {
  const body: ContentIndexResponse = { available: [...availableContentSlugs] };
  return NextResponse.json(body, { headers: cacheHeaders });
}
