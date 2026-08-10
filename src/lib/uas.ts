// AUTO-GENERATED from scripts/waf_uas.txt. Edit that file, not this one.
// Regenerate with: python3 scripts/gen_uas_ts.py (or the ad-hoc one-liner in the repo README).

export type BotCategory =
  | "search"
  | "ai"
  | "seo"
  | "directory"
  | "social"
  | "archive"
  | "uptime"
  | "control";

export interface BotEntry {
  category: BotCategory;
  label: string;
  ua: string;
}

export const BOT_UAS: readonly BotEntry[] = [
  { category: "search", label: "Googlebot Smartphone", ua: "Mozilla/5.0 (Linux; Android 6.0.1; Nexus 5X Build/MMB29P) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.6478.126 Mobile Safari/537.36 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)" },
  { category: "search", label: "Googlebot Desktop", ua: "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; Googlebot/2.1; +http://www.google.com/bot.html) Chrome/126.0.6478.126 Safari/537.36" },
  { category: "search", label: "Googlebot Image", ua: "Googlebot-Image/1.0" },
  { category: "search", label: "Google-InspectionTool", ua: "Mozilla/5.0 (compatible; Google-InspectionTool/1.0)" },
  { category: "search", label: "GoogleOther", ua: "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; GoogleOther) Chrome/126.0.6478.126 Safari/537.36" },
  { category: "search", label: "Google Storebot Desktop", ua: "Mozilla/5.0 (X11; Linux x86_64; Storebot-Google/1.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.6478.126 Safari/537.36" },
  { category: "search", label: "Bingbot", ua: "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36" },
  { category: "search", label: "BingPreview", ua: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.1938.76 Safari/537.36 BingPreview/1.0b" },
  { category: "search", label: "DuckDuckBot", ua: "DuckDuckBot/1.1; (+http://duckduckgo.com/duckduckbot.html)" },
  { category: "search", label: "Applebot", ua: "Mozilla/5.0 (Device; OS_version) AppleWebKit/WebKit_version (KHTML, like Gecko) Version/Safari_version Safari/WebKit_version (Applebot/0.1; +http://www.apple.com/go/applebot)" },
  { category: "search", label: "YandexBot", ua: "Mozilla/5.0 (compatible; YandexBot/3.0; +http://yandex.com/bots)" },
  { category: "search", label: "Baiduspider", ua: "Mozilla/5.0 (compatible; Baiduspider/2.0; +http://www.baidu.com/search/spider.html)" },
  { category: "search", label: "Sogou web spider", ua: "Sogou web spider/4.0(+http://www.sogou.com/docs/help/webmasters.htm#07)" },
  { category: "search", label: "Naver Yeti", ua: "Mozilla/5.0 (compatible; Yeti/1.1; +http://naver.me/spd)" },
  { category: "search", label: "Seznam SeznamBot", ua: "Mozilla/5.0 (compatible; SeznamBot/4.0; +http://napoveda.seznam.cz/en/seznambot-intro/)" },
  { category: "search", label: "Marginalia", ua: "search.marginalia.nu" },
  { category: "search", label: "Mojeek", ua: "Mozilla/5.0 (compatible; MojeekBot/0.11; +https://www.mojeek.com/bot.html)" },
  { category: "search", label: "Kagi Bot", ua: "Mozilla/5.0 (compatible; Kagibot/1.0; +https://kagi.com/bot)" },
  { category: "ai", label: "OpenAI GPTBot", ua: "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; GPTBot/1.4; +https://openai.com/gptbot" },
  { category: "ai", label: "OpenAI ChatGPT-User", ua: "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; ChatGPT-User/1.0; +https://openai.com/bot" },
  { category: "ai", label: "OpenAI OAI-SearchBot", ua: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36; compatible; OAI-SearchBot/1.4; +https://openai.com/searchbot" },
  { category: "ai", label: "Anthropic ClaudeBot", ua: "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; ClaudeBot/1.0; +claudebot@anthropic.com)" },
  { category: "ai", label: "Anthropic Claude-User", ua: "Mozilla/5.0 (compatible; Claude-User/1.0; +Claude-User@anthropic.com)" },
  { category: "ai", label: "Anthropic Claude-SearchBot", ua: "Mozilla/5.0 (compatible; Claude-SearchBot/1.0; +Claude-SearchBot@anthropic.com)" },
  { category: "ai", label: "Anthropic Claude-Web", ua: "Mozilla/5.0 (compatible; Claude-Web/1.0; +Claude-Web@anthropic.com)" },
  { category: "ai", label: "Perplexity PerplexityBot", ua: "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; PerplexityBot/1.0; +https://perplexity.ai/perplexitybot)" },
  { category: "ai", label: "Perplexity-User", ua: "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; Perplexity-User/1.0; +https://perplexity.ai/perplexity-user)" },
  { category: "ai", label: "Common Crawl CCBot", ua: "CCBot/2.0 (https://commoncrawl.org/faq/)" },
  { category: "ai", label: "Google-Extended (AI)", ua: "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; Google-Extended) Chrome/126.0.6478.126 Safari/537.36" },
  { category: "ai", label: "Meta-ExternalAgent", ua: "meta-externalagent/1.1 (+https://developers.facebook.com/docs/sharing/webmasters/crawler)" },
  { category: "ai", label: "Meta-ExternalFetcher", ua: "meta-externalfetcher/1.1" },
  { category: "ai", label: "Applebot-Extended", ua: "Mozilla/5.0 (Device; OS_version) AppleWebKit/WebKit_version (KHTML, like Gecko) Version/Safari_version Safari/WebKit_version (Applebot-Extended/0.1; +http://www.apple.com/go/applebot)" },
  { category: "ai", label: "Amazon Bot", ua: "Mozilla/5.0 (Linux; Android 6.0.1; Nexus 5X Build/MMB29P) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.92 Mobile Safari/537.36 (compatible; Amazonbot/0.1; +https://developer.amazon.com/support/amazonbot)" },
  { category: "ai", label: "ByteSpider (TikTok)", ua: "Mozilla/5.0 (Linux; Android 5.0) AppleWebKit/537.36 (KHTML, like Gecko) Mobile Safari/537.36 (compatible; Bytespider; spider-feedback@bytedance.com)" },
  { category: "ai", label: "Cohere cohere-ai", ua: "cohere-ai" },
  { category: "ai", label: "Diffbot", ua: "Mozilla/5.0 (compatible; Diffbot/0.1; +http://www.diffbot.com)" },
  { category: "ai", label: "Timpi Crawler", ua: "Mozilla/5.0 (compatible; Timpibot/0.8; +https://www.timpi.io)" },
  { category: "ai", label: "You.com YouBot", ua: "Mozilla/5.0 (compatible; YouBot (+http://www.you.com))" },
  { category: "ai", label: "Mistral MistralAI-User", ua: "Mozilla/5.0 (compatible; MistralAI-User/1.0; +https://docs.mistral.ai/robots)" },
  { category: "ai", label: "AI2Bot", ua: "Mozilla/5.0 (compatible) AI2Bot (+https://www.allenai.org/crawler)" },
  { category: "ai", label: "Omgili", ua: "Omgili/0.5 +http://www.omgili.com" },
  { category: "seo", label: "AhrefsBot", ua: "Mozilla/5.0 (compatible; AhrefsBot/7.0; +http://ahrefs.com/robot/)" },
  { category: "seo", label: "SemrushBot", ua: "Mozilla/5.0 (compatible; SemrushBot/7~bl; +http://www.semrush.com/bot.html)" },
  { category: "seo", label: "MJ12bot (Majestic)", ua: "Mozilla/5.0 (compatible; MJ12bot/v1.4.8; http://mj12bot.com/)" },
  { category: "seo", label: "Moz DotBot", ua: "Mozilla/5.0 (compatible; DotBot/1.2; +https://opensiteexplorer.org/dotbot; help@moz.com)" },
  { category: "seo", label: "Moz rogerbot", ua: "Mozilla/5.0 (compatible; rogerbot/1.2; +http://moz.com/help/pro/what-is-rogerbot-)" },
  { category: "seo", label: "SEOkicks", ua: "SEOkicks-Robot (+http://www.seokicks.de/robot.html)" },
  { category: "seo", label: "Screaming Frog", ua: "Screaming Frog SEO Spider/20.1" },
  { category: "seo", label: "SerpstatBot", ua: "Mozilla/5.0 (compatible; serpstatbot/2.1; abuse@serpstat.com; https://serpstat.com/users/agreement/)" },
  { category: "seo", label: "LinkArchiver", ua: "LinkArchiver/1.0 (+https://linkarchiver.com/)" },
  { category: "directory", label: "StackShareBot", ua: "Mozilla/5.0 (compatible; StackShareBot/1.0; +http://stackshare.io)" },
  { category: "directory", label: "SaaSHubBot", ua: "Mozilla/5.0 (compatible; SaaSHubBot/1.0; +https://www.saashub.com/)" },
  { category: "directory", label: "G2 Bot", ua: "Mozilla/5.0 (compatible; G2Bot/1.0; +http://www.g2.com)" },
  { category: "directory", label: "G2Crowd", ua: "G2Crowd/1.0 (+https://www.g2.com)" },
  { category: "directory", label: "Crunchbase", ua: "Mozilla/5.0 (compatible; CrunchbaseBot/1.0)" },
  { category: "directory", label: "Capterra", ua: "Mozilla/5.0 (compatible; CapterraBot/1.0)" },
  { category: "directory", label: "AlternativeToBot", ua: "AlternativeToBot/1.0 (+https://alternativeto.net)" },
  { category: "directory", label: "Product Hunt", ua: "Mozilla/5.0 (compatible; PhntmBot/0.1; +https://www.producthunt.com)" },
  { category: "directory", label: "SaaSHub plain", ua: "SaaSHub/1.0 (+https://www.saashub.com)" },
  { category: "directory", label: "StackShare plain", ua: "StackShare/1.0" },
  { category: "social", label: "LinkedInBot", ua: "LinkedInBot/1.0 (compatible; Mozilla/5.0; Apache-HttpClient +http://www.linkedin.com)" },
  { category: "social", label: "Facebook External Hit", ua: "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)" },
  { category: "social", label: "Twitterbot", ua: "Twitterbot/1.0" },
  { category: "social", label: "Slackbot Link Expanding", ua: "Slackbot-LinkExpanding 1.0 (+https://api.slack.com/robots)" },
  { category: "social", label: "Discordbot", ua: "Mozilla/5.0 (compatible; Discordbot/2.0; +https://discordapp.com)" },
  { category: "social", label: "Telegrambot", ua: "TelegramBot (like TwitterBot)" },
  { category: "social", label: "WhatsApp", ua: "WhatsApp/2.19.81 A" },
  { category: "social", label: "Pinterest", ua: "Pinterest/0.2 (+https://www.pinterest.com/bot.html)" },
  { category: "social", label: "Skype URI Preview", ua: "Mozilla/5.0 (compatible; SkypeUriPreview Preview/0.5)" },
  { category: "social", label: "Reddit Preview", ua: "redditbot/1.0" },
  { category: "archive", label: "Internet Archive (ia_archiver)", ua: "ia_archiver (+http://www.archive.org/details/archive.org_bot)" },
  { category: "archive", label: "Wayback Save Page Now", ua: "Wayback Save Page Now/1.0" },
  { category: "archive", label: "archive.today", ua: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) archive.today" },
  { category: "uptime", label: "UptimeRobot", ua: "Mozilla/5.0 (compatible; UptimeRobot/2.0; http://www.uptimerobot.com/)" },
  { category: "uptime", label: "Pingdom", ua: "Pingdom.com_bot_version_1.4_(http://www.pingdom.com/)" },
  { category: "uptime", label: "StatusCake", ua: "StatusCake_Pagespeed_Indev" },
  { category: "uptime", label: "BetterUptime", ua: "Better Uptime Bot Manifest/1.0" },
  { category: "control", label: "Fake SomeBot (control)", ua: "Mozilla/5.0 (compatible; SomeBot/1.0; +http://example.com)" },
  { category: "control", label: "Fake StackShare no version", ua: "Mozilla/5.0 (compatible; StackShareBot; +https://stackshare.io)" },
  { category: "control", label: "Empty UA", ua: "" },
  { category: "control", label: "Plain curl", ua: "curl/8.4.0" },
  { category: "control", label: "Python-urllib", ua: "Python-urllib/3.11" },
  { category: "control", label: "Real Safari macOS", ua: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15" },
] as const;

export const BOT_UA_COUNT = 83;
