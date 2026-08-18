export type TradeKind = "fruit" | "gamepass" | "limited";
export type TradeVariant = "regular" | "permanent" | "gamepass" | "limited";

export interface TradeItem {
  id: string;
  name: string;
  slug: string;
  /** fruit | gamepass | limited (data lama: physical/permanent) */
  type: TradeKind | string;
  category?: string | null;
  rarity?: string | null;
  image_url: string | null;
  regular_value: number | null;
  permanent_value: number | null;
  gamepass_value: number | null;
  price?: number | null;
  demand: string | null;
  trend: string | null;
  source: string | null;
  source_updated_at: string | null;
  updated_at: string;
}

export const KIND_LABEL: Record<string, string> = {
  fruit: "Fruit",
  gamepass: "Gamepass",
  limited: "Limited",
};

export const VARIANT_LABEL: Record<TradeVariant, string> = {
  regular: "Regular",
  permanent: "Permanent",
  gamepass: "Gamepass",
  limited: "Limited",
};

export function itemKind(it: TradeItem): TradeKind {
  if (it.type === "gamepass") return "gamepass";
  if (it.type === "limited") return "limited";
  return "fruit";
}

/** Varian yang benar-benar tersedia untuk sebuah item. */
export function availableVariants(it: TradeItem): TradeVariant[] {
  const kind = itemKind(it);
  if (kind === "gamepass") return ["gamepass"];
  if (kind === "limited") return ["limited"];
  const out: TradeVariant[] = ["regular"];
  if (Number(it.permanent_value ?? 0) > 0) out.push("permanent");
  return out;
}

/** Nilai item sesuai varian. Null = data tidak tersedia (N/A). */
export function variantValue(it: TradeItem, variant: TradeVariant): number | null {
  const pick =
    variant === "permanent"
      ? it.permanent_value
      : variant === "gamepass"
        ? it.gamepass_value
        : it.regular_value;
  const n = Number(pick ?? 0);
  return n > 0 ? n : null;
}

/** Nilai tampilan default (varian pertama yang tersedia). */
export function displayValue(it: TradeItem): number | null {
  return variantValue(it, availableVariants(it)[0]);
}

/** Format 3.91B / 150M / 900K. */
export function formatValue(v: number | null | undefined): string {
  if (v == null || Number.isNaN(Number(v))) return "N/A";
  const n = Number(v);
  const fmt = (x: number, s: string) => `${Number(x.toFixed(2))}${s}`;
  if (Math.abs(n) >= 1e9) return fmt(n / 1e9, "B");
  if (Math.abs(n) >= 1e6) return fmt(n / 1e6, "M");
  if (Math.abs(n) >= 1e3) return fmt(n / 1e3, "K");
  return String(n);
}

export interface TradeSideRow {
  key: string;
  item: TradeItem;
  variant: TradeVariant;
  qty: number;
}

export const rowKey = (it: TradeItem, variant: TradeVariant) => `${it.id}:${variant}`;

/** Demand "8/10" → 8. */
export function demandScore(it: TradeItem): number | null {
  const m = String(it.demand ?? "").match(/^(\d+(?:\.\d+)?)\s*\/\s*10/);
  return m ? Number(m[1]) : null;
}

export function sideSummary(rows: TradeSideRow[]) {
  let total = 0;
  let price = 0;
  let hasPrice = false;
  let hasUnknown = false;
  let dSum = 0;
  let dQty = 0;

  for (const r of rows) {
    const qty = Math.max(1, r.qty);
    const v = variantValue(r.item, r.variant);
    if (v == null) hasUnknown = true;
    else total += v * qty;

    const p = Number(r.item.price ?? 0);
    if (p > 0) {
      price += p * qty;
      hasPrice = true;
    }

    const d = demandScore(r.item);
    if (d != null) {
      dSum += d * qty;
      dQty += qty;
    }
  }

  return {
    total,
    hasUnknown,
    price: hasPrice ? price : null,
    demand: dQty ? Math.round((dSum / dQty) * 10) / 10 : null,
  };
}

/** Toleransi FAIR: selisih <= 5% dari sisi terbesar. */
export const FAIR_TOLERANCE = 0.05;

export type TradeResult = "WIN" | "FAIR" | "LOSE";

export function tradeResult(mine: number, theirs: number): TradeResult {
  const max = Math.max(mine, theirs);
  if (max === 0) return "FAIR";
  const diff = theirs - mine; // positif = untung untuk Player 1
  if (Math.abs(diff) / max <= FAIR_TOLERANCE) return "FAIR";
  return diff > 0 ? "WIN" : "LOSE";
}
