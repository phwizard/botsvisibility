# Deploying botsvisibility

Runs on our DigitalOcean satellite droplet (the same box as several small WordPress
sites) as a Next.js standalone server under systemd, behind Caddy and Cloudflare.

| Piece | Where |
|---|---|
| App checkout | `/var/www/botsvisibility` (owner `botsvis`, a no-login system user) |
| Process | `systemd` unit `botsvisibility` -> `node .next/standalone/server.js` on `127.0.0.1:3100`, `MemoryMax=400M` |
| Web server | Caddy vhost `botsvisibility.com` (www -> apex) `reverse_proxy 127.0.0.1:3100 { flush_interval -1 }` |
| Edge | Cloudflare proxied (orange cloud), SSL mode Full (strict) |

The probe API streams its JSON body (headers first, one result per bot), so
Cloudflare's 100s time-to-first-byte limit never cuts a slow probe, and Caddy must
not buffer it (`flush_interval -1`).

## Redeploy

```bash
ssh root@157.245.115.157 /var/www/botsvisibility/deploy/deploy.sh
```

## First-time setup (already done, kept for rebuilds)

```bash
useradd --system --home /var/www/botsvisibility --shell /usr/sbin/nologin botsvis
git clone https://github.com/phwizard/botsvisibility.git /var/www/botsvisibility
chown -R botsvis:botsvis /var/www/botsvisibility
cp /var/www/botsvisibility/deploy/botsvisibility.service /etc/systemd/system/
systemctl daemon-reload && systemctl enable botsvisibility
/var/www/botsvisibility/deploy/deploy.sh
```

Node 22 is installed from the official nodejs.org tarball at `/opt/node`
(symlinked into `/usr/local/bin`), not from apt.

## Known limit

Hosts that verify crawler identity by source IP (for example Vercel's firewall, or
Cloudflare Bot Management "verified bots") refuse any request that claims to be a
crawler but does not come from that crawler's own network. The probe will report
those sites as blocking, even though the real crawlers get through.
