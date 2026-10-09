# botsvisibility

**Live: <https://botsvisibility.com/>**

Probe a website with 80+ real crawler user-agents and see which ones your WAF, CDN, or WordPress security plugin is blocking, throttling, or serving `x-robots-tag: noindex` challenges to.

## Why

Directory sites (StackShare, G2, Capterra, Crunchbase, SaaSHub), AI crawlers (GPTBot, ClaudeBot, Google-Extended, Meta AI, Amazonbot, ByteSpider, Cohere, Mistral, ...), and even standard search engines like Bing / Yandex / Applebot get quietly 403'd or challenged by default bot-protection settings on shared hosts. Owners rarely notice - the requests never reach the origin, and the tools that would surface the problem (Google Search Console, Bing Webmaster) either don't report it or blame it on your robots.txt.

This tool sends one request per canonical crawler UA and reports the actual HTTP status your host returned. The hosted version runs from a clean datacenter IP (a small DigitalOcean server in New York), so a positive result means real crawlers can reach you too. One known limit: hosts that verify bots by source IP, such as Vercel's firewall, challenge a crawler user-agent coming from any non-crawler IP, so those sites will show blocks that the real crawler never sees.

## The story

The tool exists because we discovered our own shared host (SiteGround) was silently 403'ing 26 of 83 canonical crawler UAs on 3 different sites, including:

- **16 of 23 AI crawlers** - GPTBot, ClaudeBot, Claude-Web, CCBot, Google-Extended, Meta-ExternalAgent, Applebot-Extended, Amazonbot, ByteSpider, cohere-ai, Diffbot, Timpi, YouBot, MistralAI-User, AI2Bot, Omgili
- **All 5 targeted directory bots** - StackShareBot, SaaSHubBot, G2Bot, CrunchbaseBot, CapterraBot
- **3 SEO tools** - Majestic MJ12bot, Moz DotBot, Moz rogerbot

The block pattern was a regex on `Mozilla/5.0 (compatible; <BotName>/<version>; ...)`, designed in an earlier era to stop generic scrapers, quietly catching every AI training crawler and directory-verification bot as collateral damage. No warning in Search Console. No warning in Bing Webmaster. Just silence.

We migrated one site off SiteGround as an experiment: pass rate went from 69% to 99%. Then we built this tool to make the same diagnostic available to anyone.

The full story: [Our web host was quietly hiding us from AI agents](https://mcpforbusinessbook.com/web-host-blocking-ai-crawlers/).


## What it detects

- **WAF blocks** (HTTP 403 pattern-matching on the UA)
- **Rate-limit challenges** (e.g. SiteGround's `sg-captcha: challenge` returning 202 + `x-robots-tag: noindex`)
- **HTTP 4xx / 5xx** anomalies specific to a given UA
- **Successes** (200) which is the goal

## User-agent list

The [BOT_UAS list](src/lib/uas.ts) includes 80+ real UAs, taken from each vendor's own documentation where one is published, across:

- **Search engines** - Googlebot (desktop + mobile + image + inspection + storebot), Bingbot, DuckDuckBot, Applebot, YandexBot, Baiduspider, Sogou, Naver Yeti, SeznamBot, Mojeek, Kagi, Marginalia
- **AI crawlers** - GPTBot, ChatGPT-User, OAI-SearchBot, ClaudeBot, Claude-User, Claude-SearchBot, Claude-Web, PerplexityBot, Perplexity-User, CCBot, Google-Extended, Meta-ExternalAgent, Meta-ExternalFetcher, Applebot-Extended, Amazonbot, ByteSpider, cohere-ai, Diffbot, Timpi, YouBot, MistralAI-User, AI2Bot, Omgili
- **SEO tools** - AhrefsBot, SemrushBot, MJ12bot, DotBot, rogerbot, SEOkicks, Screaming Frog, SerpstatBot
- **Directory / comparison** - StackShareBot, SaaSHubBot, G2Bot, CrunchbaseBot, CapterraBot, AlternativeToBot, Product Hunt (PhntmBot)
- **Social / link previews** - LinkedInBot, facebookexternalhit, Twitterbot, Slackbot, Discordbot, Telegrambot, WhatsApp, Pinterest, Skype, Reddit
- **Web archives** - ia_archiver, Wayback SPN, archive.today
- **Uptime monitors** - UptimeRobot, Pingdom, StatusCake, BetterUptime
- **Controls** - a fake bot name (to isolate pattern rules), plain curl, empty UA, real Safari

## Local dev

```bash
npm install
npm run dev
```

Open http://localhost:3000, paste a URL, click Check.

## Deploy

The hosted version runs as a Next.js standalone server under systemd behind Caddy. Unit file, deploy script and notes are in [`deploy/`](deploy/README.md). Responses are streamed, so a proxy with a time-to-first-byte limit (Cloudflare: 100s) never cuts a probe short; keep response buffering off (`flush_interval -1` in Caddy).

It also runs on Vercel unchanged (`vercel deploy --prod`), with the caveat above about Vercel-hosted targets.

## License

MIT. Contributions welcome.
