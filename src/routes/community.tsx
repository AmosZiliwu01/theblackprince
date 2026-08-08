import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Search, ExternalLink } from "lucide-react";
import { SiteLayout } from "@/components/site/site-layout";
import { communityQO } from "@/lib/site-queries";

const iconFor = (p: string) => {
  const key = (p || "").toLowerCase();
  if (key.includes("whats")) return "💬";
  if (key.includes("discord")) return "🎮";
  if (key.includes("tik")) return "🎵";
  if (key.includes("you")) return "▶️";
  if (key.includes("insta")) return "📸";
  return "🔗";
};

export const Route = createFileRoute("/community")({
  head: () => ({
    meta: [
      { title: "Link — The Black Prince" },
      { name: "description", content: "Kumpulan link resmi The Black Prince: WhatsApp, Discord, TikTok, YouTube, Instagram." },
      { property: "og:title", content: "Link Resmi The Black Prince" },
      { property: "og:description", content: "Info PS, event, giveaway dibagikan lewat link resmi ini." },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(communityQO),
  component: CommunityPage,
});

function CommunityPage() {
  const links = (useQuery(communityQO).data ?? []).filter((l: any) => l.active);
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return links;
    return links.filter((l: any) =>
      [l.label, l.platform, l.url].filter(Boolean).some((v: string) => String(v).toLowerCase().includes(s)),
    );
  }, [links, q]);

  return (
    <SiteLayout>
      <section className="mx-auto max-w-3xl px-4 py-6">
        <h1 className="text-3xl font-black">
          <span className="text-gradient">Link</span>
        </h1>
        <p className="text-sm text-muted-foreground">
          Link PS, giveaway, dan promo dibagikan di grup. Gabung dulu ya bang.
        </p>

        <div className="relative mt-4">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari link... (whatsapp, discord, tiktok)"
            className="w-full rounded-xl border border-border bg-card py-2.5 pl-10 pr-3 text-sm outline-none focus:border-primary/60"
          />
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {filtered.map((l: any) => (
            <a
              key={l.id}
              href={l.url}
              target="_blank"
              rel="noreferrer"
              className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border border-border bg-card p-4 transition hover:border-primary/60 hover:shadow-neon"
            >
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary/30 to-secondary/30 text-2xl">
                {iconFor(l.platform)}
              </span>
              <div className="min-w-0">
                <p className="truncate font-bold">{l.label}</p>
                <p className="truncate break-all text-xs text-muted-foreground">{l.url}</p>
              </div>
              <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-xs font-bold text-primary-foreground sm:px-3">
                <ExternalLink className="h-3.5 w-3.5" />
                <span className="hidden xs:inline sm:inline">Buka</span>
              </span>
            </a>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full rounded-xl border border-border bg-card p-6 text-center text-sm text-muted-foreground">
              {links.length === 0 ? "Belum ada link." : "Nggak ada link yang cocok."}
            </div>
          )}
        </div>
      </section>
    </SiteLayout>
  );
}
