import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeftRight, Minus, Plus, Search, Trash2, X } from "lucide-react";
import { SiteLayout } from "@/components/site/site-layout";
import { tradeItemsQO } from "@/lib/site-queries";
import { syncTradeItems } from "@/lib/trade.functions";
import {
  FAIR_TOLERANCE,
  TYPE_LABEL,
  formatValue,
  itemValue,
  sideTotal,
  tradeResult,
  type TradeItem,
  type TradeSideRow,
} from "@/lib/trade";

export const Route = createFileRoute("/trade")({
  head: () => ({
    meta: [
      { title: "Trade Blox Fruits — Kalkulator Trade Value" },
      {
        name: "description",
        content:
          "Kalkulator trade Blox Fruits: bandingkan value dua sisi trade, fruit physical, permanent, dan gamepass. Community trade value terbaru.",
      },
      { property: "og:title", content: "Trade Blox Fruits — The Black Prince" },
      { property: "og:description", content: "Bandingkan value trade Blox Fruits: WIN, FAIR, atau LOSE." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(tradeItemsQO),
  component: TradePage,
});

type Side = "p1" | "p2";

function TradePage() {
  const qc = useQueryClient();
  const items = (useQuery(tradeItemsQO).data ?? []) as TradeItem[];
  const sync = useServerFn(syncTradeItems);

  // Isi/refresh cache otomatis (server hanya menembak sumber bila cache kadaluarsa).
  useEffect(() => {
    let cancelled = false;
    sync({ data: {} })
      .then((r: any) => {
        if (!cancelled && r?.synced > 0) qc.invalidateQueries({ queryKey: ["public", "trade_items"] });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [p1, setP1] = useState<TradeSideRow[]>([]);
  const [p2, setP2] = useState<TradeSideRow[]>([]);
  const [picker, setPicker] = useState<Side | null>(null);

  const add = (side: Side, item: TradeItem) => {
    const setter = side === "p1" ? setP1 : setP2;
    setter((rows) => {
      const i = rows.findIndex((r) => r.item.id === item.id);
      if (i >= 0) {
        const next = [...rows];
        next[i] = { ...next[i], qty: next[i].qty + 1 };
        return next;
      }
      return [...rows, { item, qty: 1 }];
    });
    setPicker(null);
  };

  const t1 = sideTotal(p1);
  const t2 = sideTotal(p2);
  const diff = Math.abs(t2.total - t1.total);
  const result = tradeResult(t1.total, t2.total);

  const lastUpdated = useMemo(() => {
    const ts = items
      .map((i) => new Date(i.source_updated_at ?? i.updated_at).getTime())
      .filter((n) => !Number.isNaN(n));
    return ts.length ? new Date(Math.max(...ts)) : null;
  }, [items]);

  const resultStyle =
    result === "WIN"
      ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-400"
      : result === "LOSE"
        ? "border-red-500/50 bg-red-500/10 text-red-400"
        : "border-border bg-muted/40 text-muted-foreground";

  return (
    <SiteLayout>
      <section className="mx-auto max-w-5xl px-4 py-6">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl gradient-primary shadow-neon">
            <ArrowLeftRight className="h-5 w-5 text-primary-foreground" />
          </span>
          <div className="min-w-0">
            <h1 className="text-2xl font-black leading-tight md:text-3xl">
              <span className="text-gradient">Trade</span> Blox Fruits
            </h1>
            <p className="text-xs text-muted-foreground">
              Community Trade Value (bukan value resmi Roblox/Blox Fruits).
            </p>
          </div>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <SideCard title="Player 1" rows={p1} setRows={setP1} onAdd={() => setPicker("p1")} total={t1} />
          <SideCard title="Player 2" rows={p2} setRows={setP2} onAdd={() => setPicker("p2")} total={t2} />
        </div>

        <div className={"mt-4 rounded-3xl border p-4 " + resultStyle}>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-[11px] uppercase tracking-widest text-muted-foreground">Player 1</p>
              <p className="text-lg font-black text-foreground">{formatValue(t1.total)}</p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-widest text-muted-foreground">Difference</p>
              <p className="text-lg font-black text-foreground">{formatValue(diff)}</p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-widest text-muted-foreground">Player 2</p>
              <p className="text-lg font-black text-foreground">{formatValue(t2.total)}</p>
            </div>
          </div>
          <p className="mt-3 text-center text-3xl font-black">{result}</p>
          <p className="mt-1 text-center text-[11px] text-muted-foreground">
            Dari sudut pandang Player 1 · FAIR bila selisih ≤ {Math.round(FAIR_TOLERANCE * 100)}% dari sisi terbesar
            {(t1.hasUnknown || t2.hasUnknown) && " · beberapa item bernilai N/A dan tidak dihitung"}
          </p>
        </div>

        <p className="mt-3 text-center text-[11px] text-muted-foreground">
          Sumber: {items[0]?.source ?? "N/A"} · Last updated:{" "}
          {lastUpdated ? lastUpdated.toLocaleString("id-ID") : "N/A"}
        </p>
      </section>

      {picker && <ItemPicker items={items} onPick={(it) => add(picker, it)} onClose={() => setPicker(null)} />}
    </SiteLayout>
  );
}

function SideCard({
  title,
  rows,
  setRows,
  onAdd,
  total,
}: {
  title: string;
  rows: TradeSideRow[];
  setRows: (fn: (r: TradeSideRow[]) => TradeSideRow[]) => void;
  onAdd: () => void;
  total: { total: number; hasUnknown: boolean };
}) {
  const setQty = (id: string, d: number) =>
    setRows((r) =>
      r.map((x) => (x.item.id === id ? { ...x, qty: Math.max(1, Math.min(99, x.qty + d)) } : x)),
    );

  return (
    <div className="rounded-3xl border border-border bg-card p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="font-black">{title}</p>
        <button
          onClick={onAdd}
          className="inline-flex items-center gap-1 rounded-xl gradient-primary px-3 py-1.5 text-xs font-bold text-primary-foreground shadow-neon"
        >
          <Plus className="h-3.5 w-3.5" /> Add Item
        </button>
      </div>

      {rows.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
          Belum ada item.
        </p>
      ) : (
        <div className="space-y-2">
          {rows.map((r) => (
            <div key={r.item.id} className="flex items-center gap-2 rounded-2xl border border-border bg-background p-2">
              <img
                src={r.item.image_url ?? ""}
                alt={r.item.name}
                loading="lazy"
                className="h-10 w-10 shrink-0 rounded-lg bg-muted object-contain"
                onError={(e) => ((e.currentTarget as HTMLImageElement).style.visibility = "hidden")}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-bold">{r.item.name}</p>
                <p className="text-[10px] text-muted-foreground">
                  {TYPE_LABEL[r.item.type] ?? r.item.type} · {formatValue(itemValue(r.item))}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <button onClick={() => setQty(r.item.id, -1)} className="rounded-md border border-border p-1" aria-label="Kurangi">
                  <Minus className="h-3 w-3" />
                </button>
                <span className="w-6 text-center text-xs font-black">{r.qty}</span>
                <button onClick={() => setQty(r.item.id, 1)} className="rounded-md border border-border p-1" aria-label="Tambah">
                  <Plus className="h-3 w-3" />
                </button>
                <button
                  onClick={() => setRows((rws) => rws.filter((x) => x.item.id !== r.item.id))}
                  className="rounded-md p-1 text-red-400 hover:bg-red-500/10"
                  aria-label="Hapus"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-2 flex items-center justify-between rounded-2xl bg-muted/40 px-3 py-2">
        <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Total Value</span>
        <span className="text-sm font-black">{formatValue(total.total)}</span>
      </div>
    </div>
  );
}

const FILTERS = [
  { key: "all", label: "Semua" },
  { key: "physical", label: "Physical" },
  { key: "permanent", label: "Permanent" },
  { key: "gamepass", label: "Gamepass" },
] as const;

function ItemPicker({
  items,
  onPick,
  onClose,
}: {
  items: TradeItem[];
  onPick: (it: TradeItem) => void;
  onClose: () => void;
}) {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<string>("all");

  const list = useMemo(() => {
    const term = q.trim().toLowerCase();
    return items
      .filter((i) => (filter === "all" ? true : i.type === filter))
      .filter((i) => (term ? i.name.toLowerCase().includes(term) || (i.slug ?? "").includes(term) : true))
      .sort((a, b) => (itemValue(b) ?? 0) - (itemValue(a) ?? 0));
  }, [items, q, filter]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-0 sm:items-center sm:p-4">
      <div className="flex max-h-[85vh] w-full max-w-lg flex-col rounded-t-3xl border border-border bg-card p-3 sm:rounded-3xl">
        <div className="mb-2 flex items-center justify-between">
          <p className="font-black">Pilih Item</p>
          <button onClick={onClose} aria-label="Tutup" className="rounded-lg p-1.5 hover:bg-accent">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari item… (mis. Buddha)"
            className="w-full rounded-xl border border-border bg-background py-2 pl-9 pr-3 text-sm outline-none focus:border-primary/60"
          />
        </div>

        <div className="mt-2 flex flex-wrap gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={
                "rounded-full border px-3 py-1 text-xs font-bold " +
                (filter === f.key ? "border-primary bg-primary/20 text-primary" : "border-border text-muted-foreground")
              }
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="mt-2 min-h-0 flex-1 space-y-1.5 overflow-y-auto pb-2">
          {list.length === 0 && <p className="p-6 text-center text-xs text-muted-foreground">Item tidak ditemukan.</p>}
          {list.map((it) => (
            <button
              key={it.id}
              onClick={() => onPick(it)}
              className="flex w-full items-center gap-2 rounded-2xl border border-border bg-background p-2 text-left hover:border-primary/60"
            >
              <img
                src={it.image_url ?? ""}
                alt={it.name}
                loading="lazy"
                className="h-10 w-10 shrink-0 rounded-lg bg-muted object-contain"
                onError={(e) => ((e.currentTarget as HTMLImageElement).style.visibility = "hidden")}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-bold">{it.name}</p>
                <p className="text-[10px] text-muted-foreground">
                  {TYPE_LABEL[it.type] ?? it.type} · Demand {it.demand ?? "N/A"} · Trend {it.trend ?? "N/A"}
                </p>
              </div>
              <span className="shrink-0 text-xs font-black text-primary">{formatValue(itemValue(it))}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
