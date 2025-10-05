import { NextResponse } from "next/server";
import { getJourneyBlueprint } from "@/lib/data/journey";

const cacheHeaders = {
  "cache-control": "public, s-maxage=120, stale-while-revalidate=300",
};

export async function GET() {
  const blueprint = await getJourneyBlueprint();
  return NextResponse.json(blueprint, { headers: cacheHeaders });
}
