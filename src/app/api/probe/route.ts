import { NextRequest, NextResponse } from "next/server";
import { lookup } from "node:dns/promises";
import { lookup as lookupCb, LookupAddress } from "node:dns";
import http from "node:http";
import https from "node:https";
import { isIP } from "node:net";
import { BOT_UAS, BotCategory, BotEntry } from "@/lib/uas";

// Probes run serially with a small delay so a single target never sees a burst
// (bursts trip rate-limit layers like SiteGround's sg-captcha). A full run takes
// 30-120s, so the response is streamed: headers go out immediately and each
// result is written as it completes. That keeps proxies with a time-to-first-byte
// limit (Cloudflare: 100s) from cutting the request, while the body is still one
// JSON document for clients that just call res.json().
export const maxDuration = 300;
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface ProbeResult {
  category: BotCategory;
  label: string;
  ua: string;
  code: number;
  note: string; // "ok" | "waf_block" | "sg_captcha:*" | "redirect" | "rate_limit" | "net_error" | "timeout" | "http_5xx" | "http_4xx" | "blocked_target"
  redirectedTo?: string;
  captcha?: string;
}

const MAX_REDIRECTS = 5;

// --- abuse limits (in-memory; one process) -------------------------------------
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_IP = 6; // probes per IP per window
const MAX_CONCURRENT = 3; // probes running at once across all visitors
const recent = new Map<string, number[]>();
let running = 0;

function clientIp(req: NextRequest): string {
  return (
    req.headers.get("cf-connecting-ip") ||
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

function allow(ip: string): boolean {
  const now = Date.now();
  const hits = (recent.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (hits.length >= MAX_PER_IP) {
    recent.set(ip, hits);
    return false;
  }
  hits.push(now);
  recent.set(ip, hits);
  if (recent.size > 5000) for (const [k, v] of recent) if (!v.some((t) => now - t < WINDOW_MS)) recent.delete(k);
  return true;
}

// --- SSRF guard: only public internet targets -----------------------------------
function isPrivateAddress(ip: string): boolean {
  if (isIP(ip) === 4) {
    const [a, b] = ip.split(".").map(Number);
    return (
      a === 0 || a === 10 || a === 127 ||
      (a === 100 && b >= 64 && b <= 127) || // CGNAT
      (a === 169 && b === 254) || // link-local incl. cloud metadata
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      (a === 192 && b === 0) ||
      (a === 198 && (b === 18 || b === 19)) ||
      a >= 224
    );
  }
  const v6 = ip.toLowerCase();
  if (v6.startsWith("::ffff:")) return isPrivateAddress(v6.slice(7));
  return v6 === "::" || v6 === "::1" || v6.startsWith("fc") || v6.startsWith("fd") || v6.startsWith("fe80") || v6.startsWith("ff");
}

async function isPublicUrl(u: URL): Promise<boolean> {
  if (u.protocol !== "http:" && u.protocol !== "https:") return false;
  if (u.port && !["80", "443"].includes(u.port)) return false;
  const host = u.hostname.replace(/^\[|\]$/g, "");
  if (host === "localhost" || host.endsWith(".localhost") || host.endsWith(".internal")) return false;
  try {
    const addrs = isIP(host) ? [{ address: host }] : await lookup(host, { all: true });
    return addrs.length > 0 && addrs.every((a) => !isPrivateAddress(a.address));
  } catch {
    return false;
  }
}

function classifyNote(code: number, captcha: string | null): string {
  if (code >= 200 && code < 300) return captcha ? `sg_captcha:${captcha}` : "ok";
  if (code === 403) return "waf_block";
  if (code === 429) return "rate_limit";
  if (code >= 300 && code < 400) return "redirect";
  if (code >= 500) return "http_5xx";
  if (code >= 400) return "http_4xx";
  return "unknown";
}

// We deliberately do NOT use the global fetch (undici): CDN bot defences now
// fingerprint it as automation and challenge it regardless of the user-agent
// (Vercel returns 403 x-vercel-mitigated: challenge), which would report blocks
// that real crawlers never see. node:https with only user-agent + accept is much
// closer to what crawlers and curl send.

// DNS lookup that refuses private addresses at connect time (no rebinding gap)
function publicLookup(
  hostname: string,
  options: object,
  cb: (err: NodeJS.ErrnoException | null, address: string | LookupAddress[], family?: number) => void,
) {
  lookupCb(hostname, { all: true }, (err, addrs) => {
    if (err) return cb(err, "");
    const list = addrs as LookupAddress[];
    if (!list.length || list.some((a) => isPrivateAddress(a.address))) {
      return cb(Object.assign(new Error("blocked_target"), { code: "EBLOCKED" }), "");
    }
    if ((options as { all?: boolean }).all) return cb(null, list);
    cb(null, list[0].address, list[0].family);
  });
}

interface RawResponse { status: number; headers: http.IncomingHttpHeaders; url: string }

function requestOnce(url: string, method: string, ua: string, signal: AbortSignal): Promise<RawResponse> {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const mod = u.protocol === "https:" ? https : http;
    const req = mod.request(
      u,
      {
        method,
        headers: { "user-agent": ua, accept: method === "GET" ? "text/html,*/*" : "*/*" },
        lookup: publicLookup as never,
        signal,
      },
      (res) => {
        resolve({ status: res.statusCode ?? 0, headers: res.headers, url });
        res.destroy(); // status + headers are all we need; never download bodies
      },
    );
    req.on("error", reject);
    req.end();
  });
}

async function guardedRequest(start: string, method: string, ua: string, signal: AbortSignal): Promise<RawResponse | "blocked"> {
  let url = start;
  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    if (!(await isPublicUrl(new URL(url)))) return "blocked";
    const res = await requestOnce(url, method, ua, signal);
    const loc = res.headers.location;
    if (res.status >= 300 && res.status < 400 && loc) {
      url = new URL(loc, url).toString();
      continue;
    }
    return res;
  }
  throw new Error("too many redirects");
}

async function probeOne(target: string, entry: BotEntry): Promise<ProbeResult> {
  const base = { category: entry.category, label: entry.label, ua: entry.ua };
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20_000);
  try {
    // HEAD first (cheap for the target); fall back to GET if HEAD isn't allowed
    let res = await guardedRequest(target, "HEAD", entry.ua, controller.signal);
    if (res !== "blocked" && res.status === 405) {
      res = await guardedRequest(target, "GET", entry.ua, controller.signal);
    }
    if (res === "blocked") return { ...base, code: 0, note: "blocked_target" };
    const captcha = (res.headers["sg-captcha"] as string | undefined) ?? null;
    const result: ProbeResult = { ...base, code: res.status, note: classifyNote(res.status, captcha) };
    if (res.url !== target) result.redirectedTo = res.url;
    if (captcha) result.captcha = captcha;
    return result;
  } catch (e: unknown) {
    const err = e as NodeJS.ErrnoException;
    if (err?.code === "EBLOCKED") return { ...base, code: 0, note: "blocked_target" };
    const msg = err?.message ?? String(e);
    return { ...base, code: 0, note: err?.name === "AbortError" || /abort|timeout/i.test(msg) ? "timeout" : "net_error" };
  } finally {
    clearTimeout(timer);
  }
}

function normalizeUrl(input: string): string | null {
  try {
    const s = input.trim();
    if (!s) return null;
    const withProto = /^https?:\/\//i.test(s) ? s : `https://${s}`;
    return new URL(withProto).toString();
  } catch {
    return null;
  }
}

function summarize(results: ProbeResult[]) {
  const pass = results.filter((r) => r.note === "ok").length;
  const byCategory = {} as Record<BotCategory, { total: number; pass: number; passRate: number }>;
  const byNote: Record<string, number> = {};
  for (const r of results) {
    byCategory[r.category] ??= { total: 0, pass: 0, passRate: 0 };
    byCategory[r.category].total += 1;
    if (r.note === "ok") byCategory[r.category].pass += 1;
    byNote[r.note] = (byNote[r.note] ?? 0) + 1;
  }
  for (const c of Object.values(byCategory)) c.passRate = c.total === 0 ? 0 : c.pass / c.total;
  return {
    pass,
    fail: results.length - pass,
    passRate: results.length === 0 ? 0 : pass / results.length,
    byCategory,
    byNote,
  };
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const target = normalizeUrl(typeof body?.url === "string" ? body.url : "");
  if (!target) return NextResponse.json({ error: "Invalid or missing url" }, { status: 400 });
  if (!(await isPublicUrl(new URL(target)))) {
    return NextResponse.json({ error: "Only public http(s) websites can be probed" }, { status: 400 });
  }
  if (!allow(clientIp(req))) {
    return NextResponse.json({ error: "Rate limit: 6 checks per 10 minutes. Please try again shortly." }, { status: 429 });
  }
  if (running >= MAX_CONCURRENT) {
    return NextResponse.json({ error: "Busy right now, please try again in a minute." }, { status: 429 });
  }

  const delayMs = Math.max(0, Math.min(2000, Number(body?.delayMs ?? 300)));
  const enc = new TextEncoder();
  running++;
  let released = false;
  let cancelled = false;
  const release = () => {
    if (!released) {
      released = true;
      running--;
    }
  };

  const stream = new ReadableStream({
    async start(controller) {
      const send = (s: string) => {
        if (!cancelled) controller.enqueue(enc.encode(s));
      };
      const results: ProbeResult[] = [];
      try {
        const head = { url: target, probedAt: new Date().toISOString(), totalUas: BOT_UAS.length };
        send(JSON.stringify(head).slice(0, -1) + ',"results":[');
        for (const [i, entry] of BOT_UAS.entries()) {
          if (cancelled) break; // visitor went away: stop hitting the target
          const r = await probeOne(target, entry);
          results.push(r);
          send((i ? "," : "") + JSON.stringify(r));
          if (delayMs > 0) await new Promise((res) => setTimeout(res, delayMs));
        }
        send('],"summary":' + JSON.stringify(summarize(results)) + "}");
      } catch (e) {
        send('],"error":' + JSON.stringify(String(e)) + "}");
      } finally {
        release();
        if (!cancelled) controller.close();
      }
    },
    cancel() {
      cancelled = true;
      release();
    },
  });

  return new Response(stream, {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "x-accel-buffering": "no",
    },
  });
}

export async function GET() {
  return NextResponse.json({ error: "POST { url } to run a probe" }, { status: 405 });
}
