import { TradeComingSoon } from "@/components/trade/coming-soon";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeftRight, Loader2, Plus, Search } from "lucide-react";
import { SiteLayout } from "@/components/site/site-layout";
import { TradeNav } from "@/components/trade/trade-nav";
import { activeOffersQO, myOffersQO, STATUS_LABEL, type TradeOffer } from "@/lib/trade-offers";
import { formatValue } from "@/lib/trade";
import { useAuthUser } from "@/hooks/use-auth";

export const Route = createFileRoute("/trade/")({
  head: () => ({
    meta: [
      { title: "Trade Blox Fruits — Cari & Buat Penawaran | The Black Prince" },
      {
        name: "description",
        content:
          "Cari penawaran trade Blox Fruits dari komunitas atau buat penawaran sendiri: pilih item yang kamu berikan dan yang kamu cari.",
      },
      { property: "og:title", content: "Trade Blox Fruits — The Black Prince" },
      { property: "og:description", content: "Marketplace trade Blox Fruits: buat penawaran, chat, dan cocokkan value." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TradeComingSoon,
});

const PAGE = 12;

function TradeListPage() {
  const user = useAuthUser();
  const { data: offers = [], isLoading, error } = useQuery(activeOffersQO);
  const { data: mine = [] } = useQuery(myOffersQO(user?.id));
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [tab, setTab] = useState<"all" | "mine">("all");

  const base = tab === "mine" ? mine : offers;
  const list = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return base;
    return base.filter(
      (o) =>
        o.title.toLowerCase().includes(t) ||
        (o.items ?? []).some((i) => i.item_name.toLowerCase().includes(t)),
    );
  }, [base, q]);

  const shown = list.slice(0, page * PAGE);

  return (
    <SiteLayout>
      <section className="mx-auto max-w-5xl px-4 py-6">
        <TradeNav />
        <div className="flex flex-wrap items-center gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl gradient-primary shadow-neon">
            <ArrowLeftRight className="h-5 w-5 text-primary-foreground" />
          </span>
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-black leading-tight md:text-3xl">
              <span className="text-gradient">Trade</span> Blox Fruits
            </h1>
            <p className="text-xs text-muted-foreground">Penawaran trade dari komunitas. Chat langsung dengan pemilik.</p>
          </div>
          <Link
            to="/trade/new"
            className="inline-flex shrink-0 items-center gap-1 rounded-xl gradient-primary px-3 py-2 text-sm font-black text-primary-foreground shadow-neon"
          >
            <Plus className="h-4 w-4" /> Buat Trade
          </Link>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          {(["all", "mine"] as const).map((t) => (
            <button
              key={t}
              onClick={() => {
                setTab(t);
                setPage(1);
              }}
              className={
                "rounded-full border px-3 py-1 text-xs font-bold " +
                (tab === t ? "border-primary bg-primary/20 text-primary" : "border-border text-muted-foreground")
              }
            >
              {t === "all" ? "Semua Penawaran" : "Trade Saya"}
            </button>
          ))}
        </div>

        <div className="relative mt-3">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
            placeholder="Cari judul atau nama item…"
            className="w-full rounded-xl border border-border bg-background py-2 pl-9 pr-3 text-sm outline-none focus:border-primary/60"
          />
        </div>

        {tab === "mine" && user === null && (
          <p className="mt-4 rounded-2xl border border-border bg-card p-4 text-sm text-muted-foreground">
            <Link to="/auth" className="font-bold text-primary">
              Masuk
            </Link>{" "}
            untuk melihat trade milikmu.
          </p>
        )}

        {isLoading ? (
          <Loader2 className="mt-6 h-5 w-5 animate-spin text-primary" />
        ) : error ? (
          <p className="mt-4 rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-300">
            Gagal memuat penawaran. Coba muat ulang halaman.
          </p>
        ) : shown.length === 0 ? (
          <p className="mt-4 rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            Belum ada penawaran. Jadilah yang pertama membuat trade!
          </p>
        ) : (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {shown.map((o) => (
              <OfferCard key={o.id} offer={o} />
            ))}
          </div>
        )}

        {shown.length < list.length && (
          <button
            onClick={() => setPage((p) => p + 1)}
            className="mx-auto mt-4 block rounded-xl border border-border px-4 py-2 text-sm font-bold hover:bg-accent"
          >
            Muat lebih banyak
          </button>
        )}
      </section>
    </SiteLayout>
  );
}

function OfferCard({ offer }: { offer: TradeOffer }) {
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

      <div className="mt-2 grid grid-cols-2 gap-2">
        <ItemStrip label="Memberi" rows={give} />
        <ItemStrip label="Mencari" rows={want} />
      </div>

      <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
        <span>Value: {formatValue(offer.offer_value)} ↔ {formatValue(offer.request_value)}</span>
        <span>{new Date(offer.created_at).toLocaleDateString("id-ID")}</span>
      </div>
    </Link>
  );
}

function ItemStrip({ label, rows }: { label: string; rows: { id: string; item_name: string; image_url: string | null; qty: number }[] }) {
  return (
    <div className="rounded-2xl bg-muted/40 p-2">
      <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</p>
      <div className="flex flex-wrap gap-1">
        {rows.length === 0 && <span className="text-[11px] text-muted-foreground">—</span>}
        {rows.slice(0, 6).map((i) => (
          <span key={i.id} className="relative">
            <img
              src={i.image_url ?? ""}
              alt={i.item_name}
              loading="lazy"
              className="h-9 w-9 rounded-lg bg-background object-contain"
              onError={(e) => ((e.currentTarget as HTMLImageElement).style.visibility = "hidden")}
            />
            {i.qty > 1 && (
              <span className="absolute -right-1 -top-1 rounded-full bg-primary px-1 text-[9px] font-black text-primary-foreground">
                {i.qty}
              </span>
            )}
          </span>
        ))}
      </div>
    </div>
  );
}
