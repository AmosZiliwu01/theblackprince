import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, RefreshCw, Search } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { syncTradeItems } from "@/lib/trade.functions";
import { KIND_LABEL, displayValue, formatValue, itemKind, type TradeItem } from "@/lib/trade";

const sb = supabase as any;

export const Route = createFileRoute("/_authenticated/admin/trade")({
  component: AdminTrade,
});

function AdminTrade() {
  const qc = useQueryClient();
  const sync = useServerFn(syncTradeItems);
  const [q, setQ] = useState("");

  const { data: rows = [], isLoading } = useQuery({
    queryKey: ["admin", "trade_items"],
    queryFn: async () => {
      const { data, error } = await sb.from("trade_items").select("*").order("name");
      if (error) throw error;
      return (data ?? []) as TradeItem[];
    },
  });

  const refresh = useMutation({
    mutationFn: async () => (await sync({ data: { force: true } })) as any,
    onSuccess: (r: any) => {
      if (r?.error) toast.error(`Sumber bermasalah: ${r.error} — cache lama tetap dipakai`);
      else toast.success(`${r?.synced ?? 0} item trade diperbarui`);
      qc.invalidateQueries({ queryKey: ["admin", "trade_items"] });
      qc.invalidateQueries({ queryKey: ["public", "trade_items"] });
    },
    onError: (e: any) => toast.error(e?.message ?? "Gagal sinkronisasi"),
  });

  const list = useMemo(() => {
    const t = q.trim().toLowerCase();
    return t ? rows.filter((r) => r.name.toLowerCase().includes(t)) : rows;
  }, [rows, q]);

  const lastUpdated = rows.length
    ? new Date(Math.max(...rows.map((r) => new Date(r.updated_at).getTime()))).toLocaleString("id-ID")
    : "—";

  return (
    <div>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black">Trade Items</h1>
          <p className="text-sm text-muted-foreground">
            Cache community trade value (sumber: {rows[0]?.source ?? "—"}). Terakhir sinkron: {lastUpdated}
          </p>
        </div>
        <button
          onClick={() => refresh.mutate()}
          disabled={refresh.isPending}
          className="inline-flex shrink-0 items-center gap-1 rounded-xl gradient-primary px-3 py-2 text-sm font-bold text-primary-foreground shadow-neon disabled:opacity-60"
        >
          {refresh.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />} Sinkron
        </button>
      </div>

      <div className="relative mb-3">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Cari item…"
          className="w-full rounded-xl border border-border bg-background py-2 pl-9 pr-3 text-sm outline-none focus:border-primary/60"
        />
      </div>

      {isLoading ? (
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
      ) : list.length === 0 ? (
        <p className="rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">
          Belum ada data. Klik Sinkron untuk mengambil data terbaru.
        </p>
      ) : (
        <div className="space-y-2">
          {list.map((r) => (
            <div key={r.id} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-2.5">
              <img
                src={r.image_url ?? ""}
                alt={r.name}
                loading="lazy"
                className="h-10 w-10 shrink-0 rounded-lg bg-muted object-contain"
                onError={(e) => ((e.currentTarget as HTMLImageElement).style.visibility = "hidden")}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold">{r.name}</p>
                <p className="truncate text-[11px] text-muted-foreground">
                  {KIND_LABEL[itemKind(r)] ?? r.type} · Demand {r.demand ?? "N/A"} · Trend {r.trend ?? "N/A"}
                </p>
              </div>
              <span className="shrink-0 text-sm font-black text-primary">{formatValue(displayValue(r))}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
