import { useMemo, useState } from "react";
import { Minus, Plus, Search, X } from "lucide-react";
import {
  KIND_LABEL,
  VARIANT_LABEL,
  availableVariants,
  demandScore,
  displayValue,
  formatValue,
  itemKind,
  variantValue,
  type TradeItem,
  type TradeVariant,
} from "@/lib/trade";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "fruit", label: "Fruits" },
  { key: "gamepass", label: "Gamepasses" },
  { key: "limited", label: "Limited" },
] as const;

/**
 * Modal pemilih item trade: cari → filter kategori → pilih item →
 * pilih varian (Regular/Permanent) + quantity.
 * Dipakai bersama oleh Calculator Trade dan form Buat Trade.
 */
export function ItemPicker({
  items,
  onAdd,
  onClose,
  addLabel = "Add to Calculator",
}: {
  items: TradeItem[];
  onAdd: (it: TradeItem, variant: TradeVariant, qty: number) => void;
  onClose: () => void;
  addLabel?: string;
}) {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<string>("all");
  const [selected, setSelected] = useState<TradeItem | null>(null);
  const [variant, setVariant] = useState<TradeVariant>("regular");
  const [qty, setQty] = useState(1);

  const term = q.trim().toLowerCase();
  /** "perm buddha" → cari "buddha" + auto pilih Permanent. */
  const wantsPerm = /^perm(anent)?\b/.test(term);
  const cleanTerm = wantsPerm ? term.replace(/^perm(anent)?\s*/, "") : term;

  /** Urutan di tab All: Fruits → Limited → Gamepasses, masing-masing value desc. */
  const kindOrder: Record<string, number> = { fruit: 0, limited: 1, gamepass: 2 };

  const list = useMemo(() => {
    return items
      .filter((i) => (filter === "all" ? true : itemKind(i) === filter))
      .filter((i) => (cleanTerm ? i.name.toLowerCase().includes(cleanTerm) || (i.slug ?? "").includes(cleanTerm) : true))
      .sort((a, b) => {
        const k = (kindOrder[itemKind(a)] ?? 9) - (kindOrder[itemKind(b)] ?? 9);
        if (k !== 0) return k;
        return (displayValue(b) ?? 0) - (displayValue(a) ?? 0);
      });
  }, [items, cleanTerm, filter]);

  const pick = (it: TradeItem) => {
    const vs = availableVariants(it);
    setSelected(it);
    setVariant(wantsPerm && vs.includes("permanent") ? "permanent" : vs[0]);
    setQty(1);
  };

  const variants = selected ? availableVariants(selected) : [];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-0 sm:items-center sm:p-4">
      <div className="flex h-[85vh] max-h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-t-3xl border border-border bg-card sm:h-[80vh] sm:rounded-3xl">
        {/* Header tetap */}
        <div className="shrink-0 border-b border-border p-3">
          <div className="mb-2 flex items-center justify-between">
            <p className="font-black">{selected ? selected.name : "Pilih Item"}</p>
            <button
              onClick={() => (selected ? setSelected(null) : onClose())}
              aria-label="Tutup"
              className="rounded-lg p-1.5 hover:bg-accent"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {!selected && (
            <>
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
                      (filter === f.key
                        ? "border-primary bg-primary/20 text-primary"
                        : "border-border text-muted-foreground")
                    }
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Body scroll */}
        {selected ? (
          <div className="min-h-0 flex-1 overflow-y-auto p-3 sm:p-4">
            <div className="mx-auto w-full max-w-xl space-y-4">
              <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3 rounded-2xl border border-border bg-background p-3">
                <img
                  src={selected.image_url ?? ""}
                  alt={selected.name}
                  className="h-16 w-16 shrink-0 rounded-xl bg-muted object-contain sm:h-20 sm:w-20"
                  onError={(e) => ((e.currentTarget as HTMLImageElement).style.visibility = "hidden")}
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-black sm:text-base">{selected.name}</p>
                  <p className="text-[11px] text-muted-foreground">{KIND_LABEL[itemKind(selected)]}</p>
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    <Chip label="Value" value={formatValue(variantValue(selected, variant))} />
                    <Chip
                      label="Demand"
                      value={demandScore(selected) != null ? `${demandScore(selected)}/10` : (selected.demand ?? "N/A")}
                    />
                    <Chip label="Trend" value={selected.trend ?? "N/A"} />
                  </div>
                </div>
              </div>

              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                  {itemKind(selected) === "fruit" ? "Fruit Type" : "Type"}
                </p>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {variants.map((v) => (
                    <button
                      key={v}
                      onClick={() => setVariant(v)}
                      className={
                        "rounded-2xl border px-3 py-2.5 text-left transition-colors " +
                        (variant === v
                          ? "border-primary bg-primary/15 text-primary"
                          : "border-border text-muted-foreground hover:border-primary/40")
                      }
                    >
                      <span className="block text-xs font-black">{VARIANT_LABEL[v]}</span>
                      <span className="block text-[11px] opacity-80">{formatValue(variantValue(selected, v))}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Quantity</p>
                <div className="mt-2 flex items-center justify-between gap-3 rounded-2xl border border-border bg-background p-2">
                  <button
                    onClick={() => setQty((n) => Math.max(1, n - 1))}
                    className="grid h-10 w-10 place-items-center rounded-xl border border-border hover:bg-accent"
                    aria-label="Kurangi"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="text-lg font-black">{qty}</span>
                  <button
                    onClick={() => setQty((n) => Math.min(99, n + 1))}
                    className="grid h-10 w-10 place-items-center rounded-xl border border-border hover:bg-accent"
                    aria-label="Tambah"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-2xl bg-muted/40 px-3 py-2 text-xs">
                <span className="text-muted-foreground">Total value</span>
                <span className="font-black text-primary">
                  {formatValue((variantValue(selected, variant) ?? 0) * qty)}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="min-h-0 flex-1 overflow-y-auto p-3">
            {list.length === 0 && <p className="p-6 text-center text-xs text-muted-foreground">Item tidak ditemukan.</p>}
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {list.map((it) => (
                <button
                  key={it.id}
                  onClick={() => pick(it)}
                  className="flex flex-col items-center gap-1 rounded-2xl border border-border bg-background p-2 text-center hover:border-primary/60"
                >
                  <img
                    src={it.image_url ?? ""}
                    alt={it.name}
                    loading="lazy"
                    className="h-14 w-14 rounded-lg bg-muted object-contain"
                    onError={(e) => ((e.currentTarget as HTMLImageElement).style.visibility = "hidden")}
                  />
                  <p className="line-clamp-2 text-[11px] font-bold leading-tight">{it.name}</p>
                  <p className="text-[10px] text-muted-foreground">{KIND_LABEL[itemKind(it)]}</p>
                  <span className="text-[11px] font-black text-primary">{formatValue(displayValue(it))}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Footer aksi */}
        {selected && (
          <div className="shrink-0 border-t border-border p-3">
            <button
              onClick={() => onAdd(selected, variant, qty)}
              className="w-full rounded-2xl gradient-primary py-3 text-sm font-black text-primary-foreground shadow-neon"
            >
              {addLabel}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Chip({ label, value }: { label: string; value: string | number }) {
  return (
    <span className="rounded-full bg-muted/60 px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
      {label} <span className="text-foreground">{value}</span>
    </span>
  );
}
