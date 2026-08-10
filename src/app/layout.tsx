import type { Metadata } from "next";
import "./globals.css";

const SITE_URL = "https://botsvisibility.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "botsvisibility - see which crawlers your site is blocking",
  description:
    "Probe your website with 80+ real crawler user-agents (search engines, AI, SEO, directory, social) and see which ones your WAF is blocking. Free. Open source.",
  openGraph: {
    title: "botsvisibility - see which crawlers your site is blocking",
    description:
      "Probe your website with 80+ real crawler user-agents (search engines, AI, SEO, directory, social) and see which ones your WAF is blocking. Free. Open source.",
    url: SITE_URL,
    siteName: "botsvisibility",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "botsvisibility - see which crawlers your site is blocking",
    description:
      "Probe your website with 80+ real crawler user-agents and see which ones your WAF is blocking.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-slate-100 antialiased">{children}</body>
    </html>
  );
}
