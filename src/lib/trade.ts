export type TradeType = "physical" | "permanent" | "gamepass";

export interface TradeItem {
  id: string;
  name: string;
  slug: string;
  type: TradeType | string;
  image_url: string | null;
  regular_value: number | null;
  permanent_value: number | null;
  gamepass_value: number | null;
  demand: string | null;
  trend: string | null;
  source: string | null;
  source_updated_at: string | null;
  updated_at: string;
}

export const TYPE_LABEL: Record<string, string> = {
  physical: "Physical",
  permanent: "Permanent",
  gamepass: "Gamepass",
};

/** Nilai trade item sesuai tipenya. Null = data tidak tersedia (N/A). */
export function itemValue(it: TradeItem): number | null {
  const v =
    it.type === "permanent" ? it.permanent_value : it.type === "gamepass" ? it.gamepass_value : it.regular_value;
  return v == null ? null : Number(v);
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
  item: TradeItem;
  qty: number;
}

export function sideTotal(rows: TradeSideRow[]): { total: number; hasUnknown: boolean } {
  let total = 0;
  let hasUnknown = false;
  for (const r of rows) {
    const v = itemValue(r.item);
    if (v == null) hasUnknown = true;
    else total += v * Math.max(1, r.qty);
  }
  return { total, hasUnknown };
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
