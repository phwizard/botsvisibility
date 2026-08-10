import { NextResponse } from "next/server";

export const dynamic = "force-static";

export function GET() {
  const body = `User-agent: *
Allow: /
Sitemap: https://botsvisibility.com/sitemap.xml
`;
  return new NextResponse(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
