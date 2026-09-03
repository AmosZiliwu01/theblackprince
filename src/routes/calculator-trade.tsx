import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeftRight, Minus, Plus, Trash2 } from "lucide-react";
import { SiteLayout } from "@/components/site/site-layout";
import { tradeItemsQO } from "@/lib/site-queries";
import { syncTradeItems } from "@/lib/trade.functions";
import { ItemPicker } from "@/components/trade/item-picker";
import { TradeNav } from "@/components/trade/trade-nav";
import {
  FAIR_TOLERANCE,
  VARIANT_LABEL,
  displayValue,
  formatValue,
  itemKind,
  rowKey,
  sideSummary,
  tradeResult,
  variantValue,
  type TradeItem,
  type TradeSideRow,
  type TradeVariant,
} from "@/lib/trade";

export const Route = createFileRoute("/calculator-trade")({
  head: () => ({
    meta: [
      { title: "Calculator Trade Blox Fruits — The Black Prince" },
      {
        name: "description",
        content:
          "Calculator Trade Blox Fruits: bandingkan value dua sisi trade, fruit regular & permanent, gamepass, dan limited. Community trade value terbaru.",
      },
      { property: "og:title", content: "Calculator Trade — The Black Prince" },
      { property: "og:description", content: "Hitung value trade Blox Fruits: WIN, FAIR, atau LOSE." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(tradeItemsQO),
  component: CalculatorTradePage,
});

type Side = "p1" | "p2";

function CalculatorTradePage() {
  const qc = useQueryClient();
  const items = (useQuery(tradeItemsQO).data ?? []) as TradeItem[];
  const sync = useServerFn(syncTradeItems);

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

  const add = (side: Side, item: TradeItem, variant: TradeVariant, qty: number) => {
    const setter = side === "p1" ? setP1 : setP2;
    const key = rowKey(item, variant);
    setter((rows) => {
      const i = rows.findIndex((r) => r.key === key);
      if (i >= 0) {
        const next = [...rows];
        next[i] = { ...next[i], qty: Math.min(99, next[i].qty + qty) };
        return next;
      }
      return [...rows, { key, item, variant, qty }];
    });
    setPicker(null);
  };

  const t1 = sideSummary(p1);
  const t2 = sideSummary(p2);
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
      ? "border-emerald-500/50 bg-emerald-500/10"
      : result === "LOSE"
        ? "border-red-500/50 bg-red-500/10"
        : "border-border bg-muted/40";

  const resultText =
    result === "WIN" ? "text-emerald-400" : result === "LOSE" ? "text-red-400" : "text-muted-foreground";

  return (
    <SiteLayout>
      <section className="mx-auto max-w-5xl px-4 py-6">
        <TradeNav />

        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl gradient-primary shadow-neon">
            <ArrowLeftRight className="h-5 w-5 text-primary-foreground" />
          </span>
          <div className="min-w-0">
            <h1 className="text-2xl font-black leading-tight md:text-3xl">
              <span className="text-gradient">Calculator</span> Trade
            </h1>
            <p className="text-xs text-muted-foreground">
              Community Trade Value Blox Fruits (bukan value resmi Roblox/Blox Fruits).
            </p>
          </div>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <SideCard title="Player 1" rows={p1} setRows={setP1} onAdd={() => setPicker("p1")} summary={t1} />
          <SideCard title="Player 2" rows={p2} setRows={setP2} onAdd={() => setPicker("p2")} summary={t2} />
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
          <p className={"mt-3 text-center text-3xl font-black " + resultText}>{result}</p>
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

      {picker && (
        <ItemPicker
          items={items}
          onAdd={(it, variant, qty) => add(picker, it, variant, qty)}
          onClose={() => setPicker(null)}
        />
      )}
    </SiteLayout>
  );
}

function SideCard({
  title,
  rows,
  setRows,
  onAdd,
  summary,
}: {
  title: string;
  rows: TradeSideRow[];
  setRows: (fn: (r: TradeSideRow[]) => TradeSideRow[]) => void;
  onAdd: () => void;
  summary: { total: number; hasUnknown: boolean; price: number | null; demand: number | null };
}) {
  const setQty = (key: string, d: number) =>
    setRows((r) => r.map((x) => (x.key === key ? { ...x, qty: Math.max(1, Math.min(99, x.qty + d)) } : x)));

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
            <div key={r.key} className="flex items-center gap-2 rounded-2xl border border-border bg-background p-2">
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
                  {VARIANT_LABEL[r.variant]} · {formatValue(variantValue(r.item, r.variant))}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <button onClick={() => setQty(r.key, -1)} className="rounded-md border border-border p-1" aria-label="Kurangi">
                  <Minus className="h-3 w-3" />
                </button>
                <span className="w-6 text-center text-xs font-black">{r.qty}</span>
                <button onClick={() => setQty(r.key, 1)} className="rounded-md border border-border p-1" aria-label="Tambah">
                  <Plus className="h-3 w-3" />
                </button>
                <button
                  onClick={() => setRows((rws) => rws.filter((x) => x.key !== r.key))}
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

      <div className="mt-2 grid grid-cols-3 gap-2 rounded-2xl bg-muted/40 px-3 py-2 text-center">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Value</p>
          <p className="text-sm font-black">{formatValue(summary.total)}</p>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Price</p>
          <p className="text-sm font-black">{summary.price == null ? "N/A" : formatValue(summary.price)}</p>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Demand</p>
          <p className="text-sm font-black">{summary.demand == null ? "N/A" : `${summary.demand}/10`}</p>
        </div>
      </div>
    </div>
  );
}
