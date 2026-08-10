# waf-check

Probe a website with 80+ real crawler user-agents and see which ones your WAF, CDN, or WordPress security plugin is blocking, throttling, or serving `x-robots-tag: noindex` challenges to.

Live: (TBD after first Vercel deploy)

## Why

Directory sites (StackShare, G2, Capterra, Crunchbase, SaaSHub), AI crawlers (GPTBot, ClaudeBot, PerplexityBot, Google-Extended), and even standard search engines like Bing / Yandex / Applebot get quietly 403'd or challenged by default bot-protection settings on shared hosts. Owners rarely notice - the requests never reach the origin, and the tools that would surface the problem (Search Console, Bing Webmaster) either don't report it or blame it on your robots.txt.

This tool sends one request per canonical crawler UA and reports the actual HTTP status your host returned. It runs from a clean Vercel egress, so a positive result means real crawlers can reach you too.

## What it detects

- **WAF blocks** (HTTP 403 pattern-matching on the UA)
- **Rate-limit challenges** (e.g. SiteGround's `sg-captcha: challenge` returning 202 + `x-robots-tag: noindex`)
- **HTTP 4xx / 5xx** anomalies specific to a given UA
- **Successes** (200) which is the goal

## User-agent list

The [BOT_UAS list](src/lib/uas.ts) is generated from [scripts/waf_uas.txt](https://github.com/dappros/ethora-bdsm/blob/main/scripts/waf_uas.txt) in the parent BDSM workspace and includes 80+ real UAs across:

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

```bash
vercel link
vercel deploy --prod
```

## License

MIT. Contributions welcome.
