#!/usr/bin/env bash
# Build + restart botsvisibility on the satellite droplet. Run as root ON the droplet:
#   ssh root@157.245.115.157 /var/www/botsvisibility/deploy/deploy.sh
# or from a workstation:
#   ssh root@157.245.115.157 'bash -s' < deploy/deploy.sh
set -euo pipefail
APP=/var/www/botsvisibility
cd "$APP"
sudo -u botsvis git pull --ff-only
sudo -u botsvis npm ci --no-audit --no-fund
# 1 vCPU / 2GB box shared with WordPress sites: build at low priority, capped heap
sudo -u botsvis env NODE_OPTIONS=--max-old-space-size=768 nice -n 19 npm run build
sudo -u botsvis cp -r .next/static .next/standalone/.next/
[ -d public ] && sudo -u botsvis cp -r public .next/standalone/ || true
systemctl restart botsvisibility
sleep 2
systemctl is-active botsvisibility
curl -fsS -o /dev/null -w "local: %{http_code}\n" http://127.0.0.1:3100/
