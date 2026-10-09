import type { NextConfig } from "next";

const config: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Self-contained server bundle (.next/standalone/server.js) for running under
  // systemd on our droplet behind Caddy. See deploy/README.md.
  output: "standalone",
};

export default config;
