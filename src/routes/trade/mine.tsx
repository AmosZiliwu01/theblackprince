import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Plus } from "lucide-react";
import { SiteLayout } from "@/components/site/site-layout";
import { TradeNav } from "@/components/trade/trade-nav";
import { myOffersQO, STATUS_LABEL, type TradeOffer } from "@/lib/trade-offers";
import { formatValue } from "@/lib/trade";
import { useAuthUser } from "@/hooks/use-auth";

export const Route = createFileRoute("/trade/mine")({
  head: () => ({
    meta: [
      { title: "Trade Saya — Kelola Penawaran | The Black Prince" },
      {
        name: "description",
        content: "Kelola penawaran trade Blox Fruits milikmu: pantau status, chat pembeli, dan tutup penawaran yang selesai.",
      },
      { property: "og:title", content: "Trade Saya — The Black Prince" },
      { property: "og:description", content: "Kelola semua penawaran trade Blox Fruits milikmu di satu halaman." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: MyTradePage,
});

function MyTradePage() {
  const user = useAuthUser();
  const { data: offers = [], isLoading } = useQuery(myOffersQO(user?.id));

  return (
    <SiteLayout>
      <section className="mx-auto max-w-5xl px-4 py-6">
        <TradeNav />

        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="min-w-0">
            <h1 className="text-2xl font-black leading-tight md:text-3xl">
              <span className="text-gradient">Trade</span> Saya
            </h1>
            <p className="text-xs text-muted-foreground">Semua penawaran yang kamu buat.</p>
          </div>
          <Link
            to="/trade/new"
            className="inline-flex shrink-0 items-center gap-1 rounded-xl gradient-primary px-3 py-2 text-sm font-black text-primary-foreground shadow-neon"
          >
            <Plus className="h-4 w-4" /> Buat Trade
          </Link>
        </div>

        {user === undefined || isLoading ? (
          <Loader2 className="mt-6 h-5 w-5 animate-spin text-primary" />
        ) : user === null ? (
          <p className="mt-4 rounded-2xl border border-border bg-card p-4 text-sm text-muted-foreground">
            <Link to="/auth" className="font-bold text-primary">
              Masuk
            </Link>{" "}
            untuk melihat dan mengelola trade milikmu.
          </p>
        ) : offers.length === 0 ? (
          <p className="mt-4 rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            Kamu belum punya penawaran. Buat trade pertamamu sekarang!
          </p>
        ) : (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {offers.map((o) => (
              <MyOfferCard key={o.id} offer={o} />
            ))}
          </div>
        )}
      </section>
    </SiteLayout>
  );
}

function MyOfferCard({ offer }: { offer: TradeOffer }) {
  const give = (offer.items ?? []).filter((i) => i.side === "offer");
  const want = (offer.items ?? []).filter((i) => i.side === "request");
  return (
    <Link
      to="/trade/$id"
      params={{ id: offer.id }}
      className="block rounded-3xl border border-border bg-card p-3 transition-colors hover:border-primary/60"
    >
      <div className="flex items-start justify-between gap-2">
        <p className="min-w-0 flex-1 truncate font-black">{offer.title}</p>
        <span className="shrink-0 rounded-full border border-border px-2 py-0.5 text-[10px] font-bold uppercase text-muted-foreground">
          {STATUS_LABEL[offer.status] ?? offer.status}
        </span>
      </div>
      <p className="mt-2 text-[11px] text-muted-foreground">
        {give.length} item diberikan · {want.length} item dicari
      </p>
      <div className="mt-1 flex items-center justify-between text-[11px] text-muted-foreground">
        <span>
          Value: {formatValue(offer.offer_value)} ↔ {formatValue(offer.request_value)}
        </span>
        <span>{new Date(offer.created_at).toLocaleDateString("id-ID")}</span>
      </div>
    </Link>
  );
}
