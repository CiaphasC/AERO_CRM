import { NextResponse } from "next/server";
import { getContentBySlug, type ContentSlug } from "@/lib/data/content";

const cacheHeaders = {
  "cache-control": "public, s-maxage=300, stale-while-revalidate=600",
};

export async function GET(_request: Request, context: { params: Promise<{ slug: ContentSlug | string }> }) {
  const { slug } = await context.params;
  const payload = await getContentBySlug(slug);

  if (!payload) {
    return NextResponse.json({ error: "content-not-found", slug }, { status: 404 });
  }

  return NextResponse.json(payload, { headers: cacheHeaders });
}

