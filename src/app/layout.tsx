import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "botsvisibility - see which crawlers your site is blocking",
  description:
    "Probe your website with 80+ real crawler user-agents (search engines, AI, SEO, directory, social) and see which ones your WAF is blocking.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-slate-100 antialiased">{children}</body>
    </html>
  );
}
