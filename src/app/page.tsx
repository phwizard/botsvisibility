"use client";

import { useMemo, useState } from "react";

type BotCategory = "search" | "ai" | "seo" | "directory" | "social" | "archive" | "uptime" | "control";

interface ProbeResult {
  category: BotCategory;
  label: string;
  ua: string;
  code: number;
  note: string;
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

const CATEGORY_LABEL: Record<BotCategory, string> = {
  search: "Search engines",
  ai: "AI crawlers",
  seo: "SEO tools",
  directory: "Directories / comparison",
  social: "Social / link previews",
  archive: "Web archives",
  uptime: "Uptime monitors",
  control: "Controls",
};

const NOTE_STYLE: Record<string, string> = {
  ok: "bg-emerald-900/40 text-emerald-300",
  waf_block: "bg-red-900/50 text-red-300",
  rate_limit: "bg-amber-900/50 text-amber-300",
  timeout: "bg-amber-900/50 text-amber-300",
  net_error: "bg-slate-700 text-slate-300",
};

function noteClass(note: string): string {
  if (note.startsWith("sg_captcha")) return "bg-amber-900/50 text-amber-300";
  if (note.startsWith("http_")) return "bg-slate-700 text-slate-300";
  return NOTE_STYLE[note] ?? "bg-slate-700 text-slate-300";
}

export default function Home() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ProbeResponse | null>(null);

  async function run() {
    if (!url.trim()) return;
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const res = await fetch("/api/probe", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || `HTTP ${res.status}`);
      }
      const json: ProbeResponse = await res.json();
      setData(json);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  const grouped = useMemo(() => {
    if (!data) return null;
    const g: Record<BotCategory, ProbeResult[]> = {
      search: [], ai: [], seo: [], directory: [], social: [], archive: [], uptime: [], control: [],
    };
    for (const r of data.results) g[r.category].push(r);
    return g;
  }, [data]);

  return (
    <main className="mx-auto max-w-5xl px-4 py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">botsvisibility</h1>
        <p className="mt-2 text-slate-400">
          Probes any URL with 80+ real crawler user-agents (search engines, AI, SEO, directory, social).
          Shows which crawlers your host is blocking, throttling, or serving noindex challenges to.
        </p>
      </header>

      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          run();
        }}
      >
        <input
          type="text"
          inputMode="url"
          placeholder="ethora.com"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="flex-1 rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-base focus:border-emerald-500 focus:outline-none"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !url.trim()}
          className="rounded-md bg-emerald-500 px-4 py-2 font-medium text-slate-950 hover:bg-emerald-400 disabled:opacity-50"
        >
          {loading ? "Probing..." : "Check"}
        </button>
      </form>
      <p className="mt-2 text-xs text-slate-500">
        Serial probe with a small delay between requests to stay under most rate limits.
        Takes ~30 seconds for a fast site, up to ~2 minutes if the target is slow.
      </p>

      {error && (
        <div className="mt-6 rounded-md border border-red-800 bg-red-950/50 px-4 py-3 text-red-200">
          Error: {error}
        </div>
      )}

      {data && grouped && (
        <section className="mt-8 space-y-8">
          <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-4">
            <div className="flex flex-wrap items-baseline justify-between gap-4">
              <div>
                <div className="text-sm text-slate-500">Probed</div>
                <div className="text-lg font-medium">{data.url}</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-slate-500">Overall pass rate</div>
                <div className="text-3xl font-semibold">
                  {(data.summary.passRate * 100).toFixed(0)}%
                </div>
                <div className="text-sm text-slate-500">
                  {data.summary.pass} / {data.totalUas} UAs passed
                </div>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
              {(Object.keys(grouped) as BotCategory[]).map((cat) => {
                const s = data.summary.byCategory[cat];
                if (!s) return null;
                return (
                  <div key={cat} className="rounded border border-slate-800 bg-slate-950/50 p-3">
                    <div className="text-xs uppercase tracking-wide text-slate-500">{CATEGORY_LABEL[cat]}</div>
                    <div className="mt-1 text-lg font-medium">
                      {s.pass}/{s.total} <span className="text-sm text-slate-500">({(s.passRate * 100).toFixed(0)}%)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {(Object.keys(grouped) as BotCategory[]).map((cat) => {
            const rows = grouped[cat];
            if (rows.length === 0) return null;
            return (
              <div key={cat}>
                <h2 className="mb-2 text-xl font-medium">{CATEGORY_LABEL[cat]}</h2>
                <div className="overflow-hidden rounded-md border border-slate-800">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-900 text-left text-xs uppercase tracking-wide text-slate-400">
                      <tr>
                        <th className="px-3 py-2">Bot</th>
                        <th className="px-3 py-2">Code</th>
                        <th className="px-3 py-2">Result</th>
                        <th className="px-3 py-2">User-Agent</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 bg-slate-950">
                      {rows.map((r, i) => (
                        <tr key={i}>
                          <td className="px-3 py-2 font-medium">{r.label}</td>
                          <td className="px-3 py-2 tabular-nums">{r.code || "-"}</td>
                          <td className={`px-3 py-2`}>
                            <span className={`rounded px-2 py-0.5 text-xs ${noteClass(r.note)}`}>{r.note}</span>
                          </td>
                          <td className="px-3 py-2 font-mono text-xs text-slate-400">{r.ua}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}

          <details className="rounded border border-slate-800 bg-slate-900/50 p-4">
            <summary className="cursor-pointer text-sm text-slate-400">Raw JSON</summary>
            <pre className="mt-2 max-h-96 overflow-auto text-xs">{JSON.stringify(data, null, 2)}</pre>
          </details>
        </section>
      )}

      <footer className="mt-16 space-y-2 border-t border-slate-800 pt-6 text-sm text-slate-500">
        <div>
          botsvisibility - free, open source (MIT).{" "}
          <a
            href="https://github.com/phwizard/botsvisibility"
            className="text-emerald-400 hover:underline"
          >
            github.com/phwizard/botsvisibility
          </a>
        </div>
        <div>
          Built after discovering that SiteGround&apos;s default WAF silently blocked
          16 of 23 AI crawlers on our sites.{" "}
          <a
            href="https://mcpforbusinessbook.com/web-host-blocking-ai-crawlers/"
            className="text-emerald-400 hover:underline"
          >
            Read the story
          </a>
          .
        </div>
      </footer>
    </main>
  );
}
