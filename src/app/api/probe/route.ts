import { NextRequest, NextResponse } from "next/server";
import { BOT_UAS, BotCategory, BotEntry } from "@/lib/uas";

// Run each probe individually + serially so a single misbehaving target doesn't
// let one UA's error swallow the whole batch. Vercel serverless has a 300s hobby
// cap; 83 UAs * ~2s each = ~166s worst case, well under.
export const maxDuration = 300;
export const runtime = "nodejs";

interface ProbeResult {
  category: BotCategory;
  label: string;
  ua: string;
  code: number;
  note: string; // "ok" | "waf_block" | "sg_captcha" | "redirect" | "net_error" | "timeout" | "http_5xx" | "http_4xx"
  redirectedTo?: string;
  captcha?: string;
}

interface ProbeResponse {
  url: string;
  probedAt: string;
  totalUas: number;
  results: ProbeResult[];
  summary: {
    pass: number;
    fail: number;
    passRate: number;
    byCategory: Record<BotCategory, { total: number; pass: number; passRate: number }>;
    byNote: Record<string, number>;
  };
}

function classifyNote(code: number, captcha: string | null): string {
  if (code >= 200 && code < 300) {
    if (captcha) return `sg_captcha:${captcha}`;
    return "ok";
  }
  if (code === 403) return "waf_block";
  if (code === 429) return "rate_limit";
  if (code >= 300 && code < 400) return "redirect";
  if (code >= 500) return "http_5xx";
  if (code >= 400) return "http_4xx";
  if (code === 0) return "net_error";
  return "unknown";
}

async function probeOne(target: string, entry: BotEntry): Promise<ProbeResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20_000);
  try {
    // HEAD first — cheap for the target. Some servers block HEAD, in which case fall back to GET.
    let res = await fetch(target, {
      method: "HEAD",
      headers: { "user-agent": entry.ua, "accept": "*/*" },
      redirect: "follow",
      signal: controller.signal,
    });
    // If server 405s HEAD (Method Not Allowed), retry GET
    if (res.status === 405) {
      res = await fetch(target, {
        method: "GET",
        headers: { "user-agent": entry.ua, "accept": "text/html,*/*" },
        redirect: "follow",
        signal: controller.signal,
      });
    }
    const captcha = res.headers.get("sg-captcha");
    const note = classifyNote(res.status, captcha);
    const result: ProbeResult = {
      category: entry.category,
      label: entry.label,
      ua: entry.ua,
      code: res.status,
      note,
    };
    if (res.url && res.url !== target) result.redirectedTo = res.url;
    if (captcha) result.captcha = captcha;
    return result;
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    const note = msg.includes("abort") || msg.includes("timeout") ? "timeout" : "net_error";
    return {
      category: entry.category,
      label: entry.label,
      ua: entry.ua,
      code: 0,
      note,
    };
  } finally {
    clearTimeout(timer);
  }
}

function normalizeUrl(input: string): string | null {
  try {
    const s = input.trim();
    if (!s) return null;
    const withProto = /^https?:\/\//i.test(s) ? s : `https://${s}`;
    const u = new URL(withProto);
    return u.toString();
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const raw = typeof body?.url === "string" ? body.url : "";
  const target = normalizeUrl(raw);
  if (!target) {
    return NextResponse.json({ error: "Invalid or missing url" }, { status: 400 });
  }

  const delayMs = Math.max(0, Math.min(2000, Number(body?.delayMs ?? 300)));
  const results: ProbeResult[] = [];
  for (const entry of BOT_UAS) {
    results.push(await probeOne(target, entry));
    if (delayMs > 0) await new Promise((r) => setTimeout(r, delayMs));
  }

  const passCount = results.filter((r) => r.note === "ok").length;
  const byCategory = {} as Record<BotCategory, { total: number; pass: number; passRate: number }>;
  const byNote: Record<string, number> = {};
  for (const r of results) {
    byCategory[r.category] ??= { total: 0, pass: 0, passRate: 0 };
    byCategory[r.category].total += 1;
    if (r.note === "ok") byCategory[r.category].pass += 1;
    byNote[r.note] = (byNote[r.note] ?? 0) + 1;
  }
  for (const cat of Object.keys(byCategory) as BotCategory[]) {
    const c = byCategory[cat];
    c.passRate = c.total === 0 ? 0 : c.pass / c.total;
  }

  const response: ProbeResponse = {
    url: target,
    probedAt: new Date().toISOString(),
    totalUas: BOT_UAS.length,
    results,
    summary: {
      pass: passCount,
      fail: results.length - passCount,
      passRate: results.length === 0 ? 0 : passCount / results.length,
      byCategory,
      byNote,
    },
  };
  return NextResponse.json(response);
}

export async function GET() {
  return NextResponse.json({ error: "POST { url } to run a probe" }, { status: 405 });
}
