import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteLayout } from "@/components/site/site-layout";
import { communityQO } from "@/lib/site-queries";

const iconFor = (p: string) => {
  const key = p.toLowerCase();
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
      { title: "Komunitas — The Black Prince" },
      { name: "description", content: "Gabung komunitas Blox Fruits The Black Prince: WhatsApp, Discord, TikTok, YouTube." },
      { property: "og:title", content: "Komunitas Blox Fruits" },
      { property: "og:description", content: "Info PS, event, giveaway dibagikan di grup komunitas." },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(communityQO),
  component: CommunityPage,
});

function CommunityPage() {
  const links = (useQuery(communityQO).data ?? []).filter((l: any) => l.active);
  return (
    <SiteLayout>
      <section className="mx-auto max-w-3xl px-4 py-6">
        <h1 className="text-3xl font-black">
          <span className="text-gradient">Komunitas</span>
        </h1>
        <p className="text-sm text-muted-foreground">
          Link PS, giveaway, dan promo dibagikan di grup. Gabung dulu ya bang.
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {links.map((l: any) => (
            <a
              key={l.id}
              href={l.url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 transition hover:border-primary/60 hover:shadow-neon"
            >
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary/30 to-secondary/30 text-2xl">
                {iconFor(l.platform)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-bold">{l.label}</p>
                <p className="truncate text-xs text-muted-foreground">{l.url}</p>
              </div>
              <span className="rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground">
                Buka
              </span>
            </a>
          ))}
          {links.length === 0 && (
            <div className="col-span-full rounded-xl border border-border bg-card p-6 text-center text-sm text-muted-foreground">
              Belum ada link komunitas.
            </div>
          )}
        </div>
      </section>
    </SiteLayout>
  );
}
