import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

const BASE_URL = "";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const paths = [
          { path: "/", priority: "1.0", changefreq: "weekly" as const },
          { path: "/fruits", priority: "0.9", changefreq: "daily" as const },
          { path: "/joki", priority: "0.8", changefreq: "weekly" as const },
          { path: "/accounts", priority: "0.8", changefreq: "weekly" as const },
          { path: "/community", priority: "0.6", changefreq: "monthly" as const },
          { path: "/live", priority: "0.6", changefreq: "daily" as const },
          { path: "/giveaway", priority: "0.6", changefreq: "weekly" as const },
          { path: "/events", priority: "0.5", changefreq: "weekly" as const },
          { path: "/faq", priority: "0.5", changefreq: "monthly" as const },
          { path: "/chat", priority: "0.7", changefreq: "weekly" as const },
        ];
        const urls = paths.map(
          (p) =>
            `  <url>\n    <loc>${BASE_URL}${p.path}</loc>\n    <changefreq>${p.changefreq}</changefreq>\n    <priority>${p.priority}</priority>\n  </url>`,
        );
        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          `</urlset>`,
        ].join("\n");
        return new Response(xml, {
          headers: { "Content-Type": "application/xml", "Cache-Control": "public, max-age=3600" },
        });
      },
    },
  },
});
