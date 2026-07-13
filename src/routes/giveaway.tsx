import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Gift } from "lucide-react";
import { SiteLayout } from "@/components/site/site-layout";
import { giveawaysQO } from "@/lib/site-queries";

export const Route = createFileRoute("/giveaway")({
  head: () => ({
    meta: [
      { title: "Giveaway — The Black Prince" },
      { name: "description", content: "Daftar giveaway aktif Blox Fruits di The Black Prince." },
      { property: "og:title", content: "Giveaway Blox Fruits" },
      { property: "og:description", content: "Ikutan giveaway fruit rare dan hadiah keren." },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(giveawaysQO),
  component: GiveawayPage,
});

function GiveawayPage() {
  const giveaways = (useQuery(giveawaysQO).data ?? []).filter((g: any) => g.active);
  return (
    <SiteLayout>
      <section className="mx-auto max-w-3xl px-4 py-6">
        <h1 className="text-3xl font-black">
          <span className="text-gradient">Giveaway</span>
        </h1>
        <div className="mt-6 space-y-4">
          {giveaways.map((g: any) => (
            <div key={g.id} className="rounded-2xl border border-primary/40 bg-gradient-to-br from-primary/10 to-secondary/10 p-5">
              <div className="flex items-start gap-3">
                <Gift className="h-6 w-6 shrink-0 text-primary" />
                <div className="min-w-0 flex-1">
                  <p className="text-lg font-black">{g.name}</p>
                  {g.description && <p className="mt-1 text-sm text-muted-foreground">{g.description}</p>}
                  <div className="mt-3 rounded-xl border border-border bg-background/50 p-3">
                    <p className="text-xs font-bold uppercase text-primary">🎁 Hadiah</p>
                    <p className="text-sm">{g.prize}</p>
                  </div>
                  <div className="mt-2 rounded-xl border border-border bg-background/50 p-3">
                    <p className="text-xs font-bold uppercase text-primary">📋 Cara Ikut</p>
                    <p className="whitespace-pre-line text-sm">{g.how_to_join}</p>
                  </div>
                  {g.ends_at && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      Deadline: {new Date(g.ends_at).toLocaleString("id-ID")}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
          {giveaways.length === 0 && (
            <div className="rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground">
              Belum ada giveaway aktif. Stay tuned ya bang!
            </div>
          )}
        </div>
      </section>
    </SiteLayout>
  );
}
